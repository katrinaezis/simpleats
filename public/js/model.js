var menu_items =
        [{type:         'sandwich',
          title:        'Pastrami',
          description:  'house-smoked beef brisket, creole mustard, baguette, half sour pickle on the side',
          price:        12.5,
          options:     [{name: 'with swiss',
                         price: 1.5,
                         type: 'boolean'}],
          thumbnail:	'PF-CHANGS-APPLE-CHAI-COBBLER-sm.jpg'
        	  },
         {type:         'sandwich',
          title:        'Grilled Salmon',
          description:  '4 oz alaskan sockeye salmon, lemon-dill aioli, lettuce, tomato, red onion, telera roll',
          price:         10,
          thumbnail:	'PF-CHANGS-SICHUAN-CHILI-GARLIC-CHICKEN-sm.jpg'},
         {type:          'plate',
          title:         'Steak Frites',
          description:   '10 oz choice rib eye grilled to your liking, herbed garlic butter, with house fries, tots or salad',
          price:         19,
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
          thumbnail:	'PF-CHANGS-HONG-KONG-STYLE-SEA-BASS-sm.jpg'
          }];


function generate_ticket() {
    var item      = menu_items[Math.floor(Math.random() * menu_items.length)];
    var options   = {};

    (item.options || []).map(function(option) {
        if (Math.random() > 0.6)
            options[option.name] = true; });
    
    return {item: item,
            options: options}; }

function generate_order() {
    var length = Math.ceil(Math.random() * 4);
    var order  = {tickets:    [],
                  time_due:  new Date(new Date() - 1 + 1000 * 60 * (Math.random() * 60 - 4))};
    
    for (var i = 0; i < length; i++) 
        order.tickets.push(generate_ticket());

    return order; }

function get_difference(time) {
    var diff = time - new Date();
    return moment.duration(diff).minutes(); }

function get_percent(time) {
    var diff = time - new Date();
    if (diff < 0) return 0;
    return diff / (1000 * 60 * 30); }
