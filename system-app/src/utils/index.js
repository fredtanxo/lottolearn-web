export const mapRolesToOptions = roles => {
  const options = [];
  roles.forEach(role => {
    options.push({ label: role['name'], value: role['id'] });
  });
  return options;
};

export const mapBooleanProperties = (object, props) => {
  props.forEach(prop => {
    object[prop] = object[prop] ? 'true' : 'false';
  });
};

export const mapTreeIdToKey = tree => {
  tree && tree.forEach(node => {
    node['key'] = node['id'];
    mapTreeIdToKey(node['children']);
  });
};
