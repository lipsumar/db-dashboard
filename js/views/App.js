var Backbone = require('backbone'),
    $ = require('jquery'),
    YAML = require('yamljs'),
    Card = require('./Card.js');

var App = Backbone.View.extend({
    initialize: function(opts){
        this.vars = {};
        this.loadConfig('show-board');
    },

    events:{
        'submit form': 'formSubmit'
    },

    formSubmit: function(e){
        e.preventDefault();

        this.vars = this.$('form').serializeArray().reduce(function(vars, v){
            vars[v.name] = v.value;
            return vars;
        }, {});

        this.trigger('varsChanged');
    },

    loadConfig: function(name){
        $.ajax({
            url:'config/'+name+'.json',
            dataType: 'text'
        }).then(this.displayConfig.bind(this));
    },

    displayConfig: function(config){
        config = YAML.parse(config);
        this.config = config;
        console.log(config);
        this.renderVars();
        this.cards = config.cards.map(this.buildCard.bind(this));
    },

    renderVars: function(){
        var inputs = $.map(this.config.vars, function(label, variable){
            var name = label || variable;
            return '<div class="var">'+name+':<input name="'+name+'" autocomplete="off"></div>';
        });
        this.$('.vars').html(inputs.join(''));
    },

    buildCard: function(cardConfig){
        var card = new Card(cardConfig);
        this.$cards.append(card.render().el);
        return card;
    },

    render: function(){
        var html = '';
        html+='<form class="top"><div class="vars"></div><button type="submit" class="reload">💥</button></form><div class="cards"></div>';
        this.$el.html(html);
        this.$cards = this.$('.cards');
        return this;
    }
});

module.exports = App;
