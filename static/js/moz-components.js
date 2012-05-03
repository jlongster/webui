(function(){
	
	mozComponents = { 
		tags: {},
		tagOptions: {
			events: {},
			methods: {
				getDelegate: function(selector, element){
					if (mozComponents.tags[selector]) selector = 'moz\\:' + selector;
					return mozComponents.query(this, selector).filter(function(node){
						return node == element || node.contains(element);
					})[0] || null;
				}
			},
			onCreate: function(event){},
			onInsert: function(event){}
		},
		query: function(element, selector){
			return Array.prototype.slice.call(element.querySelectorAll(selector), 0);
		},
		getTag: function(element){
			return (element.tagName.split(':')[1] || '').toLowerCase();
		},
		getOptions: function(element){
			return mozComponents.tags[mozComponents.getTag(element)] || mozComponents.tagOptions;
		},
		extendElement: function(element){
			if (!element.mozComponent){
				var options = mozComponents.getOptions(element);
				element.mozComponent = {};
				for (z in options.methods) element.mozComponent[z] = options.methods[z].bind(element);
				for (z in options.events) element.addEventListener(z, options.events[z], false);
				options.onCreate.call(element);
			}
		},
		onNodeInserted: function(event){
			if (event.animationName == 'nodeInserted'){
				mozComponents.extendElement(event.target);
				mozComponents.getOptions(event.target).onInsert.call(event.target);
			}
		},
		register: function(tag, options){
			['events', 'methods'].forEach(function(type){
				options[type] = options[type] || {};
				var defaults = mozComponents.tagOptions[type];
				for (z in defaults) options[type][z] = options[type][z] || defaults[z];
			});
			options.onCreate =  options.onCreate || function(){};
			options.onInsert =  options.onInsert || function(){};
			mozComponents.tags[tag] = options;
		},
		unregister: function(tag, options){
			delete mozComponents.tags[tag];
		}
	};
	
	var createElement = document.createElement;
	document.__proto__.createElement = function(tag){
		var element = createElement.call(this, tag);
		if (tag.indexOf('moz') > -1) mozComponents.extendElement(element);
		return element;
	};
	
	['animationstart', 'oAnimationStart', 'MSAnimationStart', 'webkitAnimationStart'].forEach(function(event){
		document.addEventListener(event, mozComponents.onNodeInserted, false);
	});
	
})();
