var menu_items =
        [{type:         'sandwich',
          title:        'Pastrami',
          description:  'house-smoked beef brisket, creole mustard, baguette, half sour pickle on the side',
          price:        12.5,
          prep_time:    14,
          options:     [{name: 'with swiss',
                         price: 1.5,
                         type: 'boolean'}],
          thumbnail:	'PF-CHANGS-APPLE-CHAI-COBBLER-sm.jpg'
        	  },
         {type:         'sandwich',
          title:        'Grilled Salmon',
          prep_time:     20,
          description:  '4 oz alaskan sockeye salmon, lemon-dill aioli, lettuce, tomato, red onion, telera roll',
          price:         10,
          thumbnail:	'PF-CHANGS-SICHUAN-CHILI-GARLIC-CHICKEN-sm.jpg'},
         {type:          'plate',
          title:         'Steak Frites',
          description:   '10 oz choice rib eye grilled to your liking, herbed garlic butter, with house fries, tots or salad',
          price:         19,
          prep_time:     18,
          thumbnail:	'PF-CHANGS-BUTTERNUT-SQUASH-DUMPLINGS-sm.jpg',
          options:      [{name:  'blue cheese',
                          price: 2,
                          type:  'boolean'},
                         {name:  'bacon',
                          price: 2,
                          type:  'boolean'},
                         {name:  'sauteed mushrooms',
                          price: 2,
                          type:  'boolean'},
                         {name:  'onions',
                          price: 2,
                          type:  'boolean'}]},
         {type:         'salad',
          title:        'Ceasar',
          description:  'choice of grilled or chilled chopped romaine, parmesan, fennel-dusted croutons, caesar dressing, fried capers',
          options:     [{name:   'with roasted chicken breast',
                         price:  3,
                         type:   'boolean'}],
          price:         9,
          prep_time:     10,
          thumbnail:	'PF-CHANGS-HONG-KONG-STYLE-SEA-BASS-sm.jpg'
         }];

var names = ["Sherill Bettcher",
             "Camille Bourke",
             "Janay Holbert",
             "Mari Amezquita",
             "Sharell Aberle",
             "Enid Schulte",
             "Keri Hankins",
             "Cassi Greenlaw",
             "Tyrone Fisk",
             "Magdalen Railey",
             "Latesha Onstad",
             "Ruben Nordberg",
             "Nettie Steffenson",
             "Hugo Raulston",
             "Samira Sass",
             "Alisia Demarco",
             "Sallie Son",
             "Amal Barnes",
             "Hertha Baptiste",
             "Corrie Suchan",
             "Jannet Stapp",
             "Cesar Boyle",
             "Joie Mcfatridge",
             "Agripina Mceachin",
             "Jayna Shupe",
             "Rebekah Terrazas",
             "Ellyn Letsinger",
             "Herma Ronald",
             "Christy Savino",
             "Deshawn Bochenek",
             "Jo Barnett",
             "Wendell Stack",
             "Whitney Parsons",
             "Tamera Gavin",
             "Lizzie Harryman",
             "Kristopher Middaugh",
             "Tamatha Westervelt",
             "Lettie Shor",
             "Lavenia Comeaux",
             "Luetta Fiorito",
             "Lon Waldow",
             "Gerard Zane",
             "Keturah Hendrixson",
             "Vincenzo Phillis",
             "Giselle Bouie",
             "Randy Mcmahon",
             "Lakendra Seibold",
             "Edison Sand",
             "Farrah Mcglamery",
             "Clifton Stockton"];



var tables = [];
for (var i = 0; i < 16; i++) {
    tables.push({id:                i + 1,
                 seats:             Math.ceil(Math.random() * 8) + 1,
                 currently_seated:  false,    
                 reservations:     []}); }

function find_open_table(seats_needed) {
    tables.sort(function(a, b) { return (Math.random() > 0.5) ? 1 : -1; });
    // for demo purposes...
    var open_tables = [];
    for (var i in tables) {
        var table = tables[i];
        if (table.seats >= seats_needed
            && !table.currently_seated
            && table.reservations.length == 0) 
            return table;
        else
            open_tables.push(table); }

    return open_tables[0]; }

function reserve_table(order, table) {
    order.table            = table;
    table.reservations     = [order]; }

function find_and_reserve_table(order) {
    reserve_table(order,
                  find_open_table(order.tickets.length)); }

function generate_comment() {
    var comments = ['extra parsley', 'light mayo', 'all the bacon and eggs you have', 'medium rare', 'no potatos', 'lots of potatos', false, false, false, false, false];
    var comment = [];

    comment.push(comments[Math.floor(Math.random() * comments.length)]);
    comment.push(comments[Math.floor(Math.random() * comments.length)]);
    
    return comment.filter(return_it).join(", "); }

function generate_ticket(menu_item, comment) {
    var item      = menu_item || menu_items[Math.floor(Math.random() * menu_items.length)];
    var options   = {};

    (item.options || []).map(function(option) {
        if (Math.random() > 0.6)
            options[option.name] = true; });
    
    return {item:      item,
            comments:  generate_comment(),
            options:   options}; }

function generate_order() {
    var length = Math.ceil(Math.random() * 4);
    var order  = {tickets:    [],
                  name:       names.shift(),
                  time_due:   new Date(new Date() - 1 + 1000 * 60 * (Math.random() * 30 + 18))};
    
    for (var i = 0; i < length; i++) 
        order.tickets.push(generate_ticket());

    return order; }

function start_time(order) {
    return new Date(order.time_due - longest_prep_time(order)); }

function longest_prep_time(order) {
    var time = 0;
    order.tickets.map(function(item) {
        time = Math.max(item.item.prep_time, time); });
    return time * 1000 * 60; }

function get_difference(time) {
    var diff = time - new Date();
    return moment.duration(diff).minutes(); }

function get_percent(time) {
    var diff = time - new Date();
    if (diff < 0) return 0;
    return diff / (1000 * 60 * 30); }
