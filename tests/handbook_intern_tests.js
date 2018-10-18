define(function (require) {
    var registerSuite = require('intern!object');
    var assert = require('intern/chai!assert');

    registerSuite({
        name: 'distributionhandbook',

        'conductor_slapping': function () {
            return this.remote
                .get(require.toUrl('http://distributionhandbook.com/calculators/mdpad.html?conductor_slapping.md'))
                .setFindTimeout(3000)
                .findByCssSelector('.highcharts-container')
                    .then(function () {
                        return true;
                    }).end()
                .findByCssSelector('#main_markdown')
                    .getVisibleText()
                    .then(function (text) {
                        assert.include(text, 'Conductors slap at t = 1.42 secs',
                            'results contain value');
                    }).end();
        },

        '1584': function () {
            return this.remote
                .get(require.toUrl('http://distributionhandbook.com/calculators/mdpad.html?1584.md'))
                .setFindTimeout(3000)
                .findByCssSelector('.highcharts-container')
                    .then(function () {
                        return true;
                    }).end()
                .findByCssSelector('#main_markdown')
                    .getVisibleText()
                    .then(function (text) {
                        assert.include(text, 'Incident energy for the given current and duration = 7.23 cal/cm^2',
                                       'results contain value');
                    }).end();
        },

        'arc_flash_padsw': function () {
            return this.remote
                .get(require.toUrl('http://distributionhandbook.com/calculators/mdpad.html?arc_flash_padsw.md'))
                .setFindTimeout(3000)
                .findByCssSelector('.highcharts-container')
                    .then(function () {
                        return true;
                    }).end()
                .findByCssSelector('#main_markdown')
                    .getVisibleText()
                    .then(function (text) {
                        assert.include(text, 'Incident energy for the given current and duration = 32.33 cal/cm^2',
                                       'results contain value');
                    }).end();
        },

        'burndown': function () {
            return this.remote
                .get(require.toUrl('http://distributionhandbook.com/calculators/mdpad.html?burndown.md'))
                .setFindTimeout(3000)
                .findByCssSelector('.highcharts-container')
                    .then(function () {
                        return true;
                    }).end();
        },

        'impedances': function () {
            return this.remote
                .get(require.toUrl('http://distributionhandbook.com/calculators/mdpad.html?impedances.md'))
                .setFindTimeout(3000)
                .findByCssSelector('.jsplain')
                    .getVisibleText()
                    .then(function (text) {
                        assert.include(text, 'Zg = 0.074986 + 0.2033i ohms/1000ft',
                            'results contain value');
                    });
        },

        'voltage_drop': function () {
            return this.remote
                .get(require.toUrl('http://distributionhandbook.com/calculators/mdpad.html?voltage_drop.md'))
                .setFindTimeout(3000)
                .findByCssSelector('.jsplain')
                    .getVisibleText()
                    .then(function (text) {
                        assert.include(text, 'Load-side voltages (L-N) = [       7023,       7421,       7079] V',
                            'results contain value');
                    });
        },

        'cable_capacitance': function () {
            return this.remote
                .get(require.toUrl('http://distributionhandbook.com/calculators/mdpad.html?cable_capacitance.md'))
                .setFindTimeout(3000)
                .findByCssSelector('.jsplain')
                    .getVisibleText()
                    .then(function (text) {
                        assert.include(text, 'Capacitive impedance = 26.32 kohms',
                            'results contain value');
                    });
        },

        'cvr': function () {
            return this.remote
                .get(require.toUrl('http://distributionhandbook.com/calculators/mdpad.html?cvr.md'))
                .setFindTimeout(3000)
                .findByCssSelector('.flot-overlay')
                    .then(function () {
                        return true;
                    }).end()
                .findByCssSelector('#main_markdown')
                    .getVisibleText()
                    .then(function (text) {
                        assert.include(text, 'Customer-side savings = 95.1%',
                            'results contain value');
                        assert.include(text, 'Behind the meter 96.6% 2.0% 95.1%',
                            'results contain value');
                    }).end();
        },

        'dg': function () {
            return this.remote
                .get(require.toUrl('http://distributionhandbook.com/calculators/mdpad.html?dg.md'))
                .setFindTimeout(3000)
                .findByCssSelector('.flot-overlay')
                    .then(function () {
                        return true;
                    }).end()
                .findByCssSelector('#main_markdown')
                    .getVisibleText()
                    .then(function (text) {
                        assert.include(text, 'Voltage at the generator = 124.99 V',
                            'results contain value');
                        assert.include(text, 'P = -1000 kW',
                            'results contain value');
                    }).end();
        },

        'UGPersonnelProtection': function () {
            return this.remote
                .get(require.toUrl('http://distributionhandbook.com/calculators/mdpad_hot.html?UGPersonnelProtection.md'))
                .setFindTimeout(3000)
                .findByCssSelector('.jsplain')
                    .getVisibleText()
                    .then(function (text) {
                        assert.include(text, 'all         =  1643 V',
                            'results contain value');
                    });
        },

        'StrayVoltage': function () {
            return this.remote
                .get(require.toUrl('http://distributionhandbook.com/calculators/mdpad.html?StrayVoltage.md'))
                .setFindTimeout(3000)
                .findByCssSelector('.flot-overlay')
                    .then(function () {
                        return true;
                    }).end()
                .findByCssSelector('#main_markdown')
                    .getVisibleText()
                    .then(function (text) {
                        assert.include(text, 'Maximum NEV = 22.921 V',
                            'results contain value');
                    }).end();
        },

        'CableCirculatingCurrents': function () {
            return this.remote
                .get(require.toUrl('http://distributionhandbook.com/calculators/mdpad.html?CableCirculatingCurrents.md'))
                .setFindTimeout(3000)
                .findByCssSelector('.jsplain')
                    .getVisibleText()
                    .then(function (text) {
                        assert.include(text, 'Concentric neutral currents = 63,59,73 %',
                            'results contain value');
                    }).end();
        },

        'phone_coupling': function () {
            return this.remote
                .get(require.toUrl('http://distributionhandbook.com/calculators/mdpad.html?phone_coupling.md'))
                .setFindTimeout(3000)
                .findByCssSelector('.jsplain')
                    .getVisibleText()
                    .then(function (text) {
                        assert.include(text, 'Voltage rise on the phone circuits = 105 V',
                            'results contain value');
                    }).end();
        },

        // 'fault_simulator': function () {
        //     return this.remote
        //         .get(require.toUrl('http://distributionhandbook.com/calculators/mdpad.html?fault_simulator.md'))
        //         .setFindTimeout(3000)
        //         .findByCssSelector('#text6573')
        //             .getVisibleText()
        //             .then(function (text) {
        //                 assert.include(text, '7.7∠-84°',
        //                     'results contain value');
        //             }).end();
        // },

        'OpenETran': function () {
            return this.remote
                .get(require.toUrl('http://distributionhandbook.com/calculators/mdpad_local.html?OpenETran.md'))
                .setFindTimeout(8000)
                .findByCssSelector('.flot-overlay')
                    .then(function () {
                        return true;
                    }).end()
                .findByCssSelector('#main_markdown')
                    .getVisibleText()
                    .then(function (text) {
                        assert.include(text, '6 4 56.0 17.7 12.66 2.24',
                            'results contain value');
                        assert.include(text, '2.24 flashovers/100 km/yr for GFD =1 fl',
                            'results contain value');
                    }).end();
        },

        'lightning_cable': function () {
            return this.remote
                .get(require.toUrl('http://distributionhandbook.com/calculators/mdpad_local.html?lightning_cable.md'))
                .setFindTimeout(8000)
                .findByCssSelector('.flot-overlay')
                    .then(function () {
                        return true;
                    }).end();
        },

        'cable_transients': function () {
            return this.remote
                .get(require.toUrl('http://distributionhandbook.com/calculators/mdpad_local.html?cable_transients.md'))
                .setFindTimeout(8000)
                .findByCssSelector('.flot-overlay')
                    .then(function () {
                        return true;
                    }).end();
        },

        'ferro': function () {
            return this.remote
                .get(require.toUrl('http://distributionhandbook.com/calculators/mdpad_local.html?ferro.md'))
                .setFindTimeout(8000)
                .findByCssSelector('.flot-overlay')
                    .then(function () {
                        return true;
                    }).end();
        },

        'UrbanPrimary': function () {
            return this.remote
                .get(require.toUrl('http://distributionhandbook.com/calculators/mdpad_local.html?UrbanPrimary.md'))
                .setFindTimeout(8000)
                .findByCssSelector('.flot-overlay')
                    .then(function () {
                        return true;
                    }).end();
        },

    });
});
