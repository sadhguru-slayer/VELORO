import { recycleBin, restoreMessage } from './individual';

export const getDeletedMessages = () => {
  return recycleBin;
};

export const restoreDeletedMessage = (chatId, messageId) => {
  return restoreMessage(chatId, messageId);
}; 