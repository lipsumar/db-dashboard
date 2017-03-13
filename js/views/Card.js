var Backbone = require('backbone'),
    TableView = require('./Table.js'),
    $ = require('jquery');

var Card = Backbone.View.extend({
    className: 'card',
    initialize: function(opts){

        this.title = opts.title;
        this.query = opts.query;
        this.vars = this.extractVars(this.query);

        this.tryFetch();

        window.app.on('varsChanged', this.tryFetch.bind(this));

    },

    tryFetch: function(){
        if(this.canFetch()){
            this.fetch().then(this.render.bind(this));
        }
    },

    canFetch: function(){
        if(this.vars.length === 0) return true;
        var can = true;
        this.vars.forEach(function(key){
            if(!window.app.vars[key]){
                can = false;
            }
        });
        return can;
    },

    extractVars: function(str){
        var regex = /\$([a-zA-Z0-0_-]+)/gm,
            m, vars = [];
        while ((m = regex.exec(str)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }

            // The result can be accessed through the `m`-variable.
            vars.push(m[1]);
        }
        return vars;
    },

    fetch: function(){
        var self = this;
        return $.ajax({
            url: 'php/index.php?cmd=query',
            method: 'post',
            dataType: 'json',
            data: {
                query: this.replaceVars(this.query)
            }
        }).then(function(resp){
            self.loaded = true;
            self.error = resp.error;
            self.rows = resp.rows;
        });
    },

    replaceVars: function(q){
        this.vars.forEach(function(key){
            q = q.split('$'+key).join(window.app.vars[key]);
        });

        return q;
    },

    render: function(){

        var html = '<h2>'+this.title+'</h2>';
        html+='<div class="card__body">⏳</div>';

        if(this.loaded){
            this.$el.html(html);
            if(this.error){
                this.$el.addClass('card--error').find('.card__body').html('Error: '+this.error);
                return;
            }

            var table = new TableView({
                rows: this.rows,
                fields: this.rows[0] ? Object.keys(this.rows[0]) : []
            });
            this.$('.card__body').empty().append(table.render().el);
        }else{

            this.$el.html(html);
        }




        return this;
    }
});


module.exports = Card;




