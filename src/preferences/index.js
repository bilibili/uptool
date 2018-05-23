const electron = require('electron');
const app = electron.app;
const path = require('path');
const os = require('os');
const ElectronPreferences = require('electron-preferences');

export default new ElectronPreferences({
    /**
     * Where should preferences be saved?
     */
    'dataStore': path.resolve(app.getPath('userData'), 'preferences.json'),
    /**
     * The preferences window is divided into sections. Each section has a label, an icon, and one or
     * more fields associated with it. Each section should also be given a unique ID.
     */
    'sections': [
        {
            'id': 'general',
            'label': '通用',
            /**
             * See the list of available icons below.
             */
            'icon': 'settings-gear-63',
            'form': {
                'groups': [
                    {
                        /**
                         * Group heading is optional.
                         */
                        'label': '通用',
                        'fields': [
                            {
                                'label': 'Placeholder',
                                'key': 'placeholder',
                                'type': 'text',
                                /**
                                 * Optional text to be displayed beneath the field.
                                 */
                                'help': 'some random stuff'
                            },
                            {
                                'label': 'Dummy',
                                'key': 'dummy',
                                'type': 'text',
                                'help': 'some dummy text'
                            },
                            {
                                'label': 'acfun number one',
                                'key': 'acfun',
                                'type': 'checkbox',
                                'options': [
                                    { 'label': 'agree', 'value': 'agree' }
                                ]
                            }
                        ]
                    }
                ]
            }
        }
    ]
});