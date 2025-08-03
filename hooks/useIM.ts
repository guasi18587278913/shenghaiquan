export default function useIM() {
  return {
    isReady: false,
    login: () => Promise.resolve(),
    logout: () => Promise.resolve(),
    sendMessage: () => Promise.resolve(),
    onMessageReceived: () => {},
    onConversationUpdate: () => {},
    getConversationList: () => Promise.resolve([]),
    getMessageList: () => Promise.resolve([]),
  }
}
