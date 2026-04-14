odoo.define('pos_fl.DoctorListScreen', function(require) {
    'use strict';

    const { debounce } = owl.utils;
    const PosComponent = require('point_of_sale.PosComponent');
    const Registries = require('point_of_sale.Registries');
    const { useListener } = require('web.custom_hooks');

    class DoctorListScreen extends PosComponent {
        constructor() {
            super(...arguments);
            useListener('click-save', () => this.env.bus.trigger('save-customer'));
            useListener('click-edit', () => this.editDoctor());
            useListener('save-changes', this.saveChanges);
            this.state = {
                query: null,
                selectedDoctor: this.props.doctor,
                detailIsShown: false,
                isEditMode: false,
                editModeProps: {
                    partner: {
                        country_id: this.env.pos.company.country_id,
                        state_id: this.env.pos.company.state_id,
                    }
                },
            };
            this.updateDoctorList = debounce(this.updateDoctorList, 70);
        }

        // Lifecycle hooks
        back() {
            if(this.state.detailIsShown) {
                this.state.detailIsShown = false;
                this.render();
            } else {
                this.props.resolve({ confirmed: false, payload: false });
                this.trigger('close-temp-screen');
            }
        }
        confirm() {
            this.props.resolve({ confirmed: true, payload: this.state.selectedDoctor });
            this.trigger('close-temp-screen');
        }
        // Getters
        get currentOrder() {
            return this.env.pos.get_order();
        }
        get doctors() {
            if (this.state.query && this.state.query.trim() !== '') {
                return this.env.pos.db.search_partner(this.state.query.trim());
            } else {
                return this.env.pos.db.get_partners_sorted(1000);
            }
        }
        get isNextButtonVisible() {
            return this.state.selectedDoctor ? true : false;
        }

        get nextButton() {
            if (!this.props.doctor) {
                return { command: 'set', text: 'Seleccionar Doctor' };
            } else if (this.props.doctor && this.props.doctor === this.state.selectedDoctor) {
                return { command: 'deselect', text: 'Quitar Doctor' };
            } else {
                return { command: 'set', text: 'Cambiar Doctor' };
            }
        }

        // Methods
        // We declare this event handler as a debounce function in
        // order to lower its trigger rate.
        updateDoctorList(event) {
            this.state.query = event.target.value;
            const doctors = this.doctors;
            if (event.code === 'Enter' && doctors.length === 1) {
                this.state.selectedDoctor = doctors[0];
                this.clickNext();
            } else {
                this.render();
            }
        }

        clickDoctor(event) {
            let partner = event.detail.doctor;
            if (this.state.selectedDoctor === partner) {
                this.state.selectedDoctor = null;
            } else {
                this.state.selectedDoctor = partner;
            }
            this.render();
        }
        editDoctor() {
            this.state.editModeProps = {
                partner: this.state.selectedDoctor,
            };
            this.state.detailIsShown = true;
            this.render();
        }
        clickNext() {
            this.state.selectedDoctor = this.nextButton.command === 'set' ? this.state.selectedDoctor : null;
            this.confirm();
        }
        activateEditMode(event) {
            const { isNewClient } = event.detail;
            this.state.isEditMode = true;
            this.state.detailIsShown = true;
            this.state.isNewClient = isNewClient;
            if (!isNewClient) {
                this.state.editModeProps = {
                    partner: this.state.selectedDoctor,
                };
            }
            this.render();
        }
        deactivateEditMode() {
            this.state.isEditMode = false;
            this.state.editModeProps = {
                partner: {
                    country_id: this.env.pos.company.country_id,
                    state_id: this.env.pos.company.state_id,
                },
            };
            this.render();
        }
        async saveChanges(event) {
            try {
                let partnerId = await this.rpc({
                    model: 'res.partner',
                    method: 'create_from_ui_fl',
                    args: [event.detail.processedChanges],
                });
                await this.env.pos.load_new_partners();
                this.state.selectedDoctor = this.env.pos.db.get_partner_by_id(partnerId);
                this.state.detailIsShown = false;
                this.render();
            } catch (error) {
                if (error.message.code < 0) {
                    await this.showPopup('OfflineErrorPopup', {
                        title: this.env._t('Offline'),
                        body: this.env._t('Unable to save changes.'),
                    });
                } else {
                    throw error;
                }
            }
        }
        cancelEdit() {
            this.deactivateEditMode();
        }
    }
    DoctorListScreen.template = 'DoctorListScreen';

    Registries.Component.add(DoctorListScreen);

    return DoctorListScreen;
});
