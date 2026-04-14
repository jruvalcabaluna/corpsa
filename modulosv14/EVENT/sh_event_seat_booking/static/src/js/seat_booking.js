odoo.define("sh_event_seat_booking.website_event", function (require) {
    var ajax = require("web.ajax");
    $(document).ready(function () {
        var firstSeatLabel = 1;
        if ($("#event_id").val()) {
            $.post(
                "/get_json_data",
                {
                    event_id: $("#event_id").val(),
                },
                function (bigData) {
                    bigData = JSON.parse(bigData);
                    var map_list = bigData["data"];
                    if (bigData["max_col_count"] <= 10) {
                        $("#seat-map").addClass("sh-10");
                    } else if (bigData["max_col_count"] <= 20 && bigData["max_col_count"] > 10) {
                        $("#seat-map").addClass("sh-20");
                    } else if (bigData["max_col_count"] <= 30 && bigData["max_col_count"] > 20) {
                        $("#seat-map").addClass("sh-30");
                    } else {
                        $("#seat-map").addClass("sh-50");
                    }

                    if (map_list.length > 0) {
                        var $cart = $("#selected-seats"),
                            $counter = $("#counter"),
                            $total = $("#total"),
                            sc = $("#seat-map").seatCharts({
                                map: map_list,
                                seats: bigData["seats"],
                                naming: {
                                    top: false,
                                    getLabel: function (character, row, column) {
                                        return firstSeatLabel++;
                                    },
                                },
                                legend: {
                                    node: $("#legend"),
                                    items: bigData["legend_items"],
                                },
                                click: function () {
                                    if (this.status() == "available") {
                                        var selected_seat = "R" + this.settings.id.split("_")[0] + " S" + this.settings.id.split("_")[1];
                                        $("<li>" + this.data().category + " Seat # " + "<b>" + selected_seat + ": $" + this.data().price + '</b> <a href="#" class="cancel-cart-item"><i class="fa fa-fw o_button_icon fa-close"></i></a></li>')
                                            .attr("id", "cart-item-" + this.settings.id)
                                            .data("seatId", this.settings.id)
                                            .data("seatCateg", this.data().category)
                                            .appendTo($cart);

                                        $counter.text(sc.find("selected").length + 1);
                                        $total.text(recalculateTotal(sc) + this.data().price);
                                        $(".checkout-button").removeAttr("disabled");

                                        return "selected";
                                    } else if (this.status() == "selected") {
                                        //update the counter
                                        $counter.text(sc.find("selected").length - 1);
                                        //and total
                                        $total.text(recalculateTotal(sc) - this.data().price);

                                        //remove the item from our cart
                                        $("#cart-item-" + this.settings.id).remove();

                                        if (sc.find("selected").length <= 1) {
                                            $(".checkout-button").attr("disabled", "disabled");
                                        }

                                        //seat has been vacated
                                        return "available";
                                    } else if (this.status() == "unavailable") {
                                        //seat has been already booked
                                        return "unavailable";
                                    } else {
                                        return this.style();
                                    }
                                },
                            });
                        sc.get(bigData["booked_seat"]).status("unavailable");
                        $("#selected-seats").on("click", ".cancel-cart-item", function () {
                            sc.get($(this).parents("li:first").data("seatId")).click();
                        });
                    }

                    $(document).on("click", ".checkout-button", function (ev) {
                        var unavailble_seat_tickettype = {};
                        $("#selected-seats")
                            .find("li")
                            .each(function (index) {
                                if ($(this).data("seatCateg") in unavailble_seat_tickettype) {
                                    var seat_list = unavailble_seat_tickettype[$(this).data("seatCateg")];
                                    seat_list.push($(this).data("seatId"));
                                    unavailble_seat_tickettype[$(this).data("seatCateg")] = seat_list;
                                } else {
                                    unavailble_seat_tickettype[$(this).data("seatCateg")] = [$(this).data("seatId")];
                                }
                            });
                        ev.preventDefault();
                        ev.stopPropagation();
                        var $form = $(ev.currentTarget).closest("form");
                        var $button = $(ev.currentTarget).closest('[type="submit"]');
                        $button.attr("disabled", true);

                        return ajax.jsonRpc($form.attr("action"), "call", { unavailble_seat_tickettype: unavailble_seat_tickettype }).then(function (modal) {
                            var $modal = $(modal);
                            $modal.modal({ backdrop: "static", keyboard: false });
                            $modal.find(".modal-body > div").removeClass("container"); // retrocompatibility - REMOVE ME in master / saas-19
                            $modal.appendTo("body").modal();
                            $modal.on("click", ".js_goto_event", function () {
                                $modal.modal("hide");
                                $button.prop("disabled", false);
                            });
                            $modal.on("click", ".close", function () {
                                $button.prop("disabled", false);
                            });
                        });
                    });
                }
            );
        }
    });

    function recalculateTotal(sc) {
        var total = 0;
        //basically find every selected seat and sum its price
        sc.find("selected").each(function () {
            total += this.data().price;
        });
        return total;
    }

    var _gaq = _gaq || [];
    _gaq.push(["_setAccount", "UA-36251023-1"]);
    _gaq.push(["_setDomainName", "jqueryscript.net"]);
    _gaq.push(["_trackPageview"]);

    (function () {
        var ga = document.createElement("script");
        ga.type = "text/javascript";
        ga.async = true;
        ga.src = ("https:" == document.location.protocol ? "https://ssl" : "http://www") + ".google-analytics.com/ga.js";
        var s = document.getElementsByTagName("script")[0];
        s.parentNode.insertBefore(ga, s);
    })();
});
