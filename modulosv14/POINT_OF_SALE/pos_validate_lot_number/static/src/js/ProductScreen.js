odoo.define("pos_validate_lot_number.ProductScreen",function(require){
	"use strict";

	const{_t}=require('web.core');
	const ProductScreen=require('point_of_sale.ProductScreen');
	const{useListener}=require('web.custom_hooks');
	const Registries=require('point_of_sale.Registries');
	var rpc=require('web.rpc');
	const NumberBuffer=require('point_of_sale.NumberBuffer');

	const PosProductScreen=(ProductScreen)=>class extends ProductScreen{
		_setValue(val){
			var order=this.env.pos.get_order();
			var selected_orderline=order.get_selected_orderline();
			var lot=this.env.pos.db.lot_no;
			if(selected_orderline){
				var mode=this.state.numpadMode;
				if(mode==='quantity'){
					if(selected_orderline.pack_lot_lines._byId&&selected_orderline.pack_lot_lines.models[0]){
						var lot_name=selected_orderline.pack_lot_lines.models[0].attributes["lot_name"];
						var is_lot=_.find(lot,function(num){
							return num.name==lot_name;
						});
						var count=order.product_total_by_lot(lot_name)+parseInt(val)-selected_orderline.quantity;
						if(is_lot&&(val>lot[lot_name].product_qty||count>lot[lot_name].product_qty)){
							var value=this.env.pos.get_order().get_remaining_products(lot_name);
							this.showPopup("WkLSAlertPopUp",{
								'title':'¡Fuera de cantidad del lote!',
								'body':"Cantidad máxima de productos disponibles para agregar en lote / número de serie " +lot_name+" es "+value+"."
							});
							NumberBuffer.reset();
						}else{
							super._setValue(val);
						}}else{
							super._setValue(val);
						}}else{
							super._setValue(val);
						}
					}
				}

		async _clickProduct(event){
			var self=this;
			let price_extra=0.0;
			let packLotLinesToEdit,draftPackLotLines,description,weight;
			const product=event.detail;
			if(['serial','lot'].includes(product.tracking)){
				const isAllowOnlyOneLot=product.isAllowOnlyOneLot();
				if(isAllowOnlyOneLot){packLotLinesToEdit=[];
				}else{
					const orderline=this.currentOrder.get_orderlines().filter(line=>!line.get_discount()).find(line=>line.product.id===product.id);
					if(orderline){packLotLinesToEdit=orderline.getPackLotLinesToEdit();
					}else{
						packLotLinesToEdit=[];
					}
				}
		const{confirmed,payload}=await this.showPopup('EditListPopup',{
			title:this.env._t('Lote /Numero Serie es Requerido'),
			isSingleItem:isAllowOnlyOneLot,
			array:packLotLinesToEdit,
			product:product,
		});
		if(confirmed){
			const modifiedPackLotLines=Object.fromEntries(payload.newArray.filter(item=>item.id).map(item=>[item.id,item.text]));
			const newPackLotLines=payload.newArray.filter(item=>!item.id).map(item=>({lot_name:item.text}));
			draftPackLotLines={modifiedPackLotLines,newPackLotLines};
		}else{
			return;
		}
		if(product.to_weight&&this.env.pos.config.iface_electronic_scale){
			if(this.isScaleAvailable){
				const{confirmed,payload}=await this.showTempScreen('ScaleScreen',{
					product,
				});
				if(confirmed){
					weight=payload.weight;
				}else{
					return;
				}
			}else{
				await this._onScaleNotAvailable();
			}
		}
		this.currentOrder.add_product(product,{
			draftPackLotLines,
			description:description,
			price_extra:price_extra,
			quantity:weight,
		});
		NumberBuffer.reset();
	}
	else{
		super._clickProduct(event)
	}
}}

	Registries.Component.extend(ProductScreen,PosProductScreen);
	return ProductScreen;
});;