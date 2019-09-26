export default {
  setupComponent(attrs, component) {
    if (!attrs.category.custom_fields) {
      attrs.category.custom_fields = {};
    }

    const settingValueToggle = function(name) {
      const categorySetting = attrs.category.custom_fields[name];
      const property = name.camelize();
      const value = categorySetting !== undefined ? categorySetting : false;

      component.set(property, value);

      component.addObserver(property, function() {
        if (this._state === 'destroying') return;
        attrs.category.custom_fields[name] = component.get(property);
      })
    }

    settingValueToggle('projects_enabled');
  }
};
