const { InteractionManager } = require('react-native');

// Substitui o runAfterInteractions por setTimeout se necessário
const originalRunAfterInteractions = InteractionManager.runAfterInteractions;

InteractionManager.runAfterInteractions = (task) => {
  if (typeof task === 'function') {
    return originalRunAfterInteractions(task);
  }
  return { cancel: () => {} };
};

module.exports = InteractionManager;
