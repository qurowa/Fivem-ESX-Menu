(function () {
    let MenuTpl =
        '<div id="menu_{{_namespace}}_{{_name}}" class="menu{{#align}} align-{{align}}{{/align}}">' +
'<div class="header-image"></div>' +
        '<div class="head-default head_{{{css}}}"><span>{{{title}}}</span></div>' +
        '<div class="menu-items">' +
        '{{#elements}}' +
        '<div class="menu-item {{#selected}}selected{{/selected}}">' +
        '{{{label}}}{{#isSlider}} : &lt;{{{sliderLabel}}}&gt;{{/isSlider}}' +
        '</div>' +
        '{{/elements}}' +
        '</div>' +
        '</div>' +
        '</div>';

    window.ORP_MENU = {};
    ORP_MENU.ResourceName = 'Cuh-default';
    ORP_MENU.opened = {};
    ORP_MENU.focus = [];
    ORP_MENU.pos = {};

    ORP_MENU.open = function (namespace, name, data) {

        if (typeof ORP_MENU.opened[namespace] == 'undefined')
            ORP_MENU.opened[namespace] = {};

        if (typeof ORP_MENU.opened[namespace][name] != 'undefined')
            ORP_MENU.close(namespace, name);

        if (typeof ORP_MENU.pos[namespace] == 'undefined')
            ORP_MENU.pos[namespace] = {};

        for (let i = 0; i < data.elements.length; i++)
            if (typeof data.elements[i].type == 'undefined')
                data.elements[i].type = 'default';

        data._index = ORP_MENU.focus.length;
        data._namespace = namespace;
        data._name = name;

        for (let i = 0; i < data.elements.length; i++) {
            data.elements[i]._namespace = namespace;
            data.elements[i]._name = name;
        }

        ORP_MENU.opened[namespace][name] = data;
        ORP_MENU.pos[namespace][name] = 0;

        for (let i = 0; i < data.elements.length; i++) {
            if (data.elements[i].selected)
                ORP_MENU.pos[namespace][name] = i;
            else
                data.elements[i].selected = false
        }

        ORP_MENU.focus.push({
            namespace: namespace,
            name: name
        });

        ORP_MENU.render();

        $('#menu_' + namespace + '_' + name).find('.menu-item.selected')[0].scrollIntoView();
    }

    ORP_MENU.close = function (namespace, name) {

        delete ORP_MENU.opened[namespace][name];

        for (let i = 0; i < ORP_MENU.focus.length; i++) {
            if (ORP_MENU.focus[i].namespace == namespace && ORP_MENU.focus[i].name == name) {
                ORP_MENU.focus.splice(i, 1);
                break;
            }
        }

        ORP_MENU.render();

    }

    ORP_MENU.render = function () {

        let menuContainer = document.getElementById('menus');
        let focused = ORP_MENU.getFocused();
        menuContainer.innerHTML = '';

        $(menuContainer).hide();

        for (let namespace in ORP_MENU.opened) {
            for (let name in ORP_MENU.opened[namespace]) {

                let menuData = ORP_MENU.opened[namespace][name];
                let view = JSON.parse(JSON.stringify(menuData))

                for (let i = 0; i < menuData.elements.length; i++) {

                    let element = view.elements[i];

                    switch (element.type) {

                        case 'default':
                            break;

                        case 'slider': {

                            element.isSlider = true;
                            element.sliderLabel = (typeof element.options == 'undefined') ? element.value : element.options[element.value];

                            break;
                        }

                        default:
                            break;

                    }

                    if (i == ORP_MENU.pos[namespace][name])
                        element.selected = true;
                }

                let menu = $(Mustache.render(MenuTpl, view))[0];

                $(menu).hide();

                menuContainer.appendChild(menu);
            }
        }

        if (typeof focused != 'undefined')
            $('#menu_' + focused.namespace + '_' + focused.name).show();

        $(menuContainer).show();

    }

    ORP_MENU.submit = function (namespace, name, data) {
        $.post('http://' + ORP_MENU.ResourceName + '/menu_submit', JSON.stringify({
            _namespace: namespace,
            _name: name,
            current: data,
            elements: ORP_MENU.opened[namespace][name].elements
        }));
    }

    ORP_MENU.cancel = function (namespace, name) {
        $.post('http://' + ORP_MENU.ResourceName + '/menu_cancel', JSON.stringify({
            _namespace: namespace,
            _name: name
        }));
    }

    ORP_MENU.change = function (namespace, name, data) {
        $.post('http://' + ORP_MENU.ResourceName + '/menu_change', JSON.stringify({
            _namespace: namespace,
            _name: name,
            current: data,
            elements: ORP_MENU.opened[namespace][name].elements
        }));
    }

    ORP_MENU.getFocused = function () {
        return ORP_MENU.focus[ORP_MENU.focus.length - 1];
    }

    window.onData = (data) => {

        switch (data.action) {

            case 'openMenu': {
                ORP_MENU.open(data.namespace, data.name, data.data);
                break;
            }

            case 'closeMenu': {
                ORP_MENU.close(data.namespace, data.name);
                break;
            }

            case 'controlPressed': {

                switch (data.control) {

                    case 'ENTER': {

                        let focused = ORP_MENU.getFocused();

                        if (typeof focused != 'undefined') {

                            let menu = ORP_MENU.opened[focused.namespace][focused.name];
                            let pos = ORP_MENU.pos[focused.namespace][focused.name];
                            let elem = menu.elements[pos];

                            if (menu.elements.length > 0)
                                ORP_MENU.submit(focused.namespace, focused.name, elem);

                        }

                        break;
                    }

                    case 'BACKSPACE': {

                        let focused = ORP_MENU.getFocused();

                        if (typeof focused != 'undefined') {

                            ORP_MENU.cancel(focused.namespace, focused.name);

                        }

                        break;
                    }

                    case 'TOP': {

                        let focused = ORP_MENU.getFocused();

                        if (typeof focused != 'undefined') {

                            let menu = ORP_MENU.opened[focused.namespace][focused.name];
                            let pos = ORP_MENU.pos[focused.namespace][focused.name];

                            if (pos > 0)
                                ORP_MENU.pos[focused.namespace][focused.name]--;
                            else
                                ORP_MENU.pos[focused.namespace][focused.name] = menu.elements.length - 1;

                            let elem = menu.elements[ORP_MENU.pos[focused.namespace][focused.name]];

                            for (let i = 0; i < menu.elements.length; i++) {
                                if (i == ORP_MENU.pos[focused.namespace][focused.name])
                                    menu.elements[i].selected = true
                                else
                                    menu.elements[i].selected = false
                            }

                            ORP_MENU.change(focused.namespace, focused.name, elem)
                            ORP_MENU.render();

                            $('#menu_' + focused.namespace + '_' + focused.name).find('.menu-item.selected')[0].scrollIntoView();

                        }

                        break;

                    }

                    case 'DOWN': {

                        let focused = ORP_MENU.getFocused();

                        if (typeof focused != 'undefined') {

                            let menu = ORP_MENU.opened[focused.namespace][focused.name];
                            let pos = ORP_MENU.pos[focused.namespace][focused.name];
                            let length = menu.elements.length;

                            if (pos < length - 1)
                                ORP_MENU.pos[focused.namespace][focused.name]++;
                            else
                                ORP_MENU.pos[focused.namespace][focused.name] = 0;

                            let elem = menu.elements[ORP_MENU.pos[focused.namespace][focused.name]];

                            for (let i = 0; i < menu.elements.length; i++) {
                                if (i == ORP_MENU.pos[focused.namespace][focused.name])
                                    menu.elements[i].selected = true
                                else
                                    menu.elements[i].selected = false
                            }

                            ORP_MENU.change(focused.namespace, focused.name, elem)
                            ORP_MENU.render();

                            $('#menu_' + focused.namespace + '_' + focused.name).find('.menu-item.selected')[0].scrollIntoView();

                        }

                        break;
                    }

                    case 'LEFT': {

                        let focused = ORP_MENU.getFocused();

                        if (typeof focused != 'undefined') {

                            let menu = ORP_MENU.opened[focused.namespace][focused.name];
                            let pos = ORP_MENU.pos[focused.namespace][focused.name];
                            let elem = menu.elements[pos];

                            switch (elem.type) {

                                case 'default':
                                    break;

                                case 'slider': {

                                    let min = (typeof elem.min == 'undefined') ? 0 : elem.min;

                                    if (elem.value > min) {
                                        elem.value--;
                                        ORP_MENU.change(focused.namespace, focused.name, elem)
                                    }

                                    ORP_MENU.render();

                                    break;
                                }

                                default:
                                    break;

                            }

                            $('#menu_' + focused.namespace + '_' + focused.name).find('.menu-item.selected')[0].scrollIntoView();

                        }

                        break;
                    }

                    case 'RIGHT': {

                        let focused = ORP_MENU.getFocused();

                        if (typeof focused != 'undefined') {

                            let menu = ORP_MENU.opened[focused.namespace][focused.name];
                            let pos = ORP_MENU.pos[focused.namespace][focused.name];
                            let elem = menu.elements[pos];

                            switch (elem.type) {

                                case 'default':
                                    break;

                                case 'slider': {

                                    if (typeof elem.options != 'undefined' && elem.value < elem.options.length - 1) {
                                        elem.value++;
                                        ORP_MENU.change(focused.namespace, focused.name, elem)
                                    }

                                    if (typeof elem.max != 'undefined' && elem.value < elem.max) {
                                        elem.value++;
                                        ORP_MENU.change(focused.namespace, focused.name, elem)
                                    }

                                    ORP_MENU.render();

                                    break;
                                }

                                default:
                                    break;

                            }

                            $('#menu_' + focused.namespace + '_' + focused.name).find('.menu-item.selected')[0].scrollIntoView();

                        }

                        break;
                    }

                    default:
                        break;

                }

                break;
            }

        }

    }

    window.onload = function (e) {
        window.addEventListener('message', (event) => {
            onData(event.data)
        });
    }

})()
