$(function() {
    if (window.location.hash != '') {
        const nav_link = $(`a.nav-link[href='${window.location.hash}']`);

        if (nav_link.length > 0) {
            navLinkActive(nav_link);
            pageActiveFromNavLink(nav_link);
        }
    }

    $('a.nav-link').click(function() {
        navLinkActive($(this));
        pageActiveFromNavLink($(this));
    });

    $('button.next-step').click(function() {
        const href = $(this).attr('data-step');
        const nav_link = $(`a.nav-link[href='${href}']`);

        navLinkActive(nav_link);
        pageActiveFromNavLink(nav_link);
    });

    $('img').on('click', function(e) {
        $('#imgViewer').empty().append( $(e.currentTarget).clone().removeClass('img-responsive').removeClass('img-thumbnail') );
        $('#viewImg').modal('show');
    });
});

function navLinkActive(obj) {
    $('a.nav-link').removeClass('active');
    $(obj).addClass('active');
}

function pageActiveFromNavLink(obj) {
    const targetPage = $(obj).attr('href');
    
    $('div.page').removeClass('active');
    $(targetPage).addClass('active');

    history.pushState({}, "", targetPage);

    if (targetPage === '#datapackage') {
        loadDatapackage();
    }
}

function loadDatapackage() {
    const character = 'jill';
    const scenario = 'a';

    Promise.all([
        $.getJSON(`data/${character}/items.json`),
        $.getJSON(`data/${character}/${scenario}/locations.json`),
        $.getJSON(`data/${character}/${scenario}/locations_hardcore.json`),
        $.getJSON(`data/${character}/${scenario}/locations_nightmare.json`),
        $.getJSON(`data/${character}/${scenario}/locations_inferno.json`)
    ]).then(function ([items, locations, locations_hardcore, locations_nightmare, locations_inferno]) {
        const panel_items = $('#datapackage div.panel-items');
        const panel_locations = $('#datapackage div.panel-locations');

        panel_items.empty();
        panel_locations.empty();

        $('<h4 />').html('Items:').prependTo(panel_items);
        $('<em />').html('Names in parentheses are item groups that can be hinted for.').appendTo(panel_items);
        $('<h4 />').html('Locations:').prependTo(panel_locations);

        const list_items = $('<ul />').appendTo(panel_items);
        const list_locations = $('<ul />').appendTo(panel_locations);
        $('<h4 />').html('Hardcore Locations:').appendTo(panel_locations);
        const list_locations_hardcore = $('<ul />').appendTo(panel_locations);
        $('<h4 />').html('Nightmare Locations:').appendTo(panel_locations);
        const list_locations_nightmare = $('<ul />').appendTo(panel_locations);
        $('<h4 />').html('Inferno Locations:').appendTo(panel_locations);
        const list_locations_inferno = $('<ul />').appendTo(panel_locations);

        items.forEach(function (item) {
            const groups = ('groups' in item ? item['groups'] : null);

            $('<li />').html(item['name'] + (groups ? ' (' + groups.join(', ') + ')' : '')).appendTo(list_items);
        });

        locations.forEach(function (location) {
            $('<li />').html(`${location['region']}: ${location['name']}`).appendTo(list_locations);
        });

        locations_hardcore.forEach(function (location) {
            $('<li />').html(`${location['region']}: ${location['name']}`).appendTo(list_locations_hardcore);
        });

        locations_nightmare.forEach(function (location) {
            $('<li />').html(`${location['region']}: ${location['name']}`).appendTo(list_locations_nightmare);
        });

        locations_inferno.forEach(function (location) {
            $('<li />').html(`${location['region']}: ${location['name']}`).appendTo(list_locations_inferno);
        });
    }).catch(function (err) {
        console.error('Failed to load datapackage', err);
        $('#datapackage div.panel-items').html('<p>Failed to load datapackage items.</p>');
        $('#datapackage div.panel-locations').html('<p>Failed to load datapackage locations.</p>');
    });
}

function exportYAML() {
    const form_object = $('#form_yaml');
    const tab = '    '; // tab = 4 spaces, since \t doesn't work on export
    let form_data = {};

    for (const item of form_object.serializeArray()) {
        form_data[item['name']] = item['value'];
    }

    const player_name = (form_data['player_name'] != '' ? form_data['player_name'] : 'Player');

    let fileContents = `name: ${player_name}\n` +
        "game: RE3 Remake\n" +
        "requires:\n" +
        `${tab}version: 0.6.5\n\n` +
        "RE3Remake:\n" +
        `${tab}progression_balancing: 50\n` +
        `${tab}accessibility: items\n`;

    fileContents += `${tab}difficulty: ${form_data['difficulty']}\n` +
        `${tab}death_link: ${form_data['death_link'] == 'on'}\n` +
        `${tab}allow_missable_locations: ${form_data['allow_missable_locations'] == 'on'}\n` +
        `${tab}allow_progression_in_nest: ${form_data['allow_progression_in_nest'] == 'on'}\n` +
        `${tab}add_files_as_locations: ${form_data['add_files_as_locations']}\n` +
        `${tab}add_enemy_kills_as_locations: ${form_data['add_enemy_kills_as_locations']}\n` +
        `${tab}enemy_kill_items: ${form_data['enemy_kill_items']}\n` +
        `${tab}starting_hip_pouches: ${form_data['starting_hip_pouches']}\n` +
        `${tab}bonus_start: ${form_data['bonus_start'] == 'on'}\n` +
        `${tab}early_fire_hose: ${form_data['early_fire_hose'] == 'on'}\n` +
        `${tab}extra_sewer_items: ${form_data['extra_sewer_items'] == 'on'}\n` +
        `${tab}local_weapons: ${form_data['local_weapons'] == 'on'}\n` +
        `${tab}double_weapons: ${form_data['double_weapons'] == 'on'}\n` +
        `${tab}ammo_pack_modifier: ${form_data['ammo_pack_modifier']}\n` +
        `${tab}oops_all_grenades: ${form_data['oops_all_grenades'] == 'on'}\n` +
        `${tab}oops_all_handguns: ${form_data['oops_all_handguns'] == 'on'}\n`;

    const file = new Blob([fileContents], { type: "text/yaml;charset=utf-8" });
    saveAs(file, `RE3R_${player_name}.yaml`);
}
