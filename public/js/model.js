var menu_items =
        [{type:         'sandwich',
          title:        'Pastrami',
          description:  'house-smoked beef brisket, creole mustard, baguette, half sour pickle on the side',
          price:        [12, 0],
          options:     [{name: 'with swiss',
                         price: [1, 50],
                         type: 'boolean'}]},
         {type:         'sandwich',
          title:        'Grilled Salmon',
          description:  '4 oz alaskan sockeye salmon, lemon-dill aioli, lettuce, tomato, red onion, telera roll',
          price:         [10, 0]},
         {type:          'plate',
          title:         'Steak Frites',
          description:   '10 oz choice rib eye grilled to your liking, herbed garlic butter, with house fries, tots or salad',
          price:         [19, 0],
          options:      [{name:  'blue cheese',
                          price: [2, 0],
                          type:  'boolean'},
                         {name:  'bacon',
                          price: [2, 0],
                          type:  'boolean'},
                         {name:  'sauteed mushrooms',
                          price: [2, 0],
                          type:  'boolean'},
                         {name:  'onions',
                          price: [2, 0],
                          type:  'boolean'}]},
         {type:         'salad',
          title:        'Ceasar',
          description:  'choice of grilled or chilled chopped romaine, parmesan, fennel-dusted croutons, caesar dressing, fried capers',
          options:     [{name:   'with roasted chicken breast',
                         price:  [3, 0],
                         type:   'boolean'}],
          price:         [9, 0]}];


function generate_ticket() {
    var item      = menu_items[Math.floor(Math.random() * menu_items.length)];
    var options   = {};

    item.options.map(function(option) {
        if (Math.rand() > 0.6)
            options[option.name] = true; });
    
    return {item: item,
            options: options}; }

function generate_order() {
    var length = Math.ceil(Math.random() * 4);
    var order  = {tickets:    [],
                  time_due:  new Date(new Date() - 1 + 1000 * 60 * (Math.random() * 60 - 30))};
    
    for (var i = 0; i <= length; i++) 
        order.tickets.push(generate_ticket());

    return order; }
