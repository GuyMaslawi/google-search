import { SUGGEST_RESULTS } from "../constants/mocks";

const STORAGE_LIMIT = 10;

export const filterDataBySearch = (arr, item) => {
  if (item) {
    const filteredList = arr?.filter((el) => {
      const text = el?.text?.trim();
      return text?.toLowerCase().startsWith(item);
    });
    return filteredList;
  }
  return null;
};

export const findFullDataByText = (text) => {
  return SUGGEST_RESULTS?.find((item) => {
    return item?.text === text?.trim();
  });
};

export const storeInLocalStorage = (item) => {
  const storage = JSON.parse(localStorage.getItem("historySearch") || "[]");
  if (storage) {
    storage.push(item);
    localStorage.setItem("historySearch", JSON.stringify(storage));
    return;
  }
  localStorage.setItem("historySearch", JSON.stringify(item));
};

export const storeLastSearch = (item) => {
  localStorage.setItem("lastSearch", JSON.stringify(item));
};

export const checkIfIdExistOnStorage = (id) => {
  const storage = JSON.parse(localStorage.getItem("historySearch"));
  if (storage) {
    return !!storage.find((item) => item?.id === id);
  }
  return false;
};

export const isLocalStorageReachLimit = (storage) => {
  return storage?.length < STORAGE_LIMIT;
};

export const convertMilisecondsToSeconds = (milliseconds) => {
  return `${(milliseconds / 1000).toFixed(10)} seconds`;
};
