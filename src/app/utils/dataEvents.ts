export const ECHO_DATA_UPDATED_EVENT = "echo-data-updated";

export const notifyEchoDataUpdated = () => {
  window.dispatchEvent(new Event(ECHO_DATA_UPDATED_EVENT));
};