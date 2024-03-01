'use strict';
var $$ = Dom7;
Framework7.use(Framework7Vue);
// Init Vue App
var myVue = new Vue({
    // App Root Element
    el: '#app',
    // App root data
    data() {
        return {
            f7params: {
                // Array with app routes
                routes: [

                ],
                // App Name
                name: 'My App',
                // App id
                id: 'com.myapp.test',
                theme: 'auto',
                touch: {
                    tapHold: false,
                    iosTouchRipple: false,
                    mdTouchRipple: false,
                    activeState: true,
                    tapHoldDelay: 250
                }
            }
        };
    },

    // App root methods
    methods: {
                
        //end vue  
    }
});

