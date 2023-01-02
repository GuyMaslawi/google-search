import { useCallback, useEffect, useMemo, useState } from "react";
import { SUGGEST_RESULTS } from "../constants/mocks";
import {
  checkIfIdExistOnStorage,
  convertMilisecondsToSeconds,
  filterDataBySearch,
  findFullDataByText,
  isLocalStorageReachLimit,
  storeInLocalStorage,
  storeLastSearch,
} from "../utils";
import "./GoogleSearch.scss";

const GoogleSearch = () => {
  const [inputOnFocus, setInputOnFocus] = useState(true);
  const [historySearchResults, setHistorySearchResults] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [filteredHistoryResults, setFilteredHistoryResults] = useState([]);
  const [resultsData, setResultsData] = useState([]);
  const [performenceTime, setPerformenceTime] = useState(0);

  const historySearchStorage = localStorage.getItem("historySearch");
  const lastSearchStorage = localStorage.getItem("lastSearch");

  useEffect(() => {
    if (historySearchStorage !== null) {
      const data = JSON.parse(historySearchStorage);
      setHistorySearchResults(data);
    }
  }, [historySearchStorage]);

  const handleClick = useCallback(
    (item) => {
      const startTime = performance.now();

      if (item) {
        /**
         * when we delete from input block of text and click enter
         * we can only use the text value
         * so here we search the text on the mock data we have to find the whole object
         * **/
        let findItemData = null;
        if (typeof item === "string") {
          findItemData = findFullDataByText(item);
        }
        const data = findItemData ?? item;

        /**
         * 1) check if storage not reached the limit (10
         * 2) check if the input value exist in the mock data
         * otherwise we not add it to local storage
         * **/
        if (!isLocalStorageReachLimit(historySearchStorage)) {
          const isSearchValueValid =
            !!filterDataBySearch(SUGGEST_RESULTS, data?.text) &&
            !checkIfIdExistOnStorage(data?.id);

          if (isSearchValueValid) {
            storeInLocalStorage(data);
          }
        }

        const res = filterDataBySearch(SUGGEST_RESULTS, data?.text);
        setResultsData(res);
        const endTime = performance.now();
        setPerformenceTime(endTime - startTime);
        const filteredHistoryArr = filterDataBySearch(
          historySearchResults,
          data?.text
        );
        setFilteredHistoryResults(filteredHistoryArr);
        setInputOnFocus(false);
        setSearchValue(data?.text);
        storeLastSearch(data);
        setFilteredData([]);
        setFilteredHistoryResults([]);
        return;
      }
      return;
    },
    [historySearchResults, historySearchStorage]
  );

  useEffect(() => {
    if (lastSearchStorage !== null) {
      const data = JSON.parse(lastSearchStorage);
      setSearchValue(data?.text);
      handleClick(data);
    }
  }, [handleClick, lastSearchStorage]);

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    const filteredArr = filterDataBySearch(SUGGEST_RESULTS, value);
    setFilteredData(filteredArr);
    const filteredHistoryArr = filterDataBySearch(historySearchResults, value);
    setFilteredHistoryResults(filteredHistoryArr);
  };

  const noResultsFound = useMemo(() => {
    return inputOnFocus && resultsData?.length < 1 && searchValue?.length > 0;
  }, [inputOnFocus, resultsData, searchValue]);

  /** show reulst box only if
   * 1) search value contains something
   * 2) historyResults contains something and input on focus
   * **/
  const isSearchResults = useMemo(() => {
    return inputOnFocus && searchValue?.length > 0;
  }, [inputOnFocus, searchValue?.length]);

  return (
    <div className="wrapper">
      <input
        type="search"
        className={isSearchResults ? "search-bar open" : "search-bar"}
        placeholder="Search..."
        value={searchValue}
        autoFocus
        onChange={handleChange}
        onKeyDown={(e) =>
          e.key === "Enter" && !noResultsFound
            ? handleClick(e.target.value)
            : null
        }
        onBlur={() => setInputOnFocus(false)}
        onFocus={() => setInputOnFocus(true)}
      />
      <div className="search-results">
        <ul>
          {filteredHistoryResults?.length > 0 &&
            filteredHistoryResults?.map((item) => (
              <li
                key={item?.id}
                className="history"
                onClick={() => handleClick(item)}
              >
                <span className="material-symbols-outlined">history</span>
                <span>{item.text}</span>
              </li>
            ))}
          {filteredData?.length > 0
            ? filteredData?.map((item) => (
                <li key={item?.id} onClick={() => handleClick(item)}>
                  <span className="material-symbols-outlined">search</span>
                  <span>{item?.text}</span>
                </li>
              ))
            : noResultsFound && <li className="no-results">no results</li>}
        </ul>
      </div>

      {resultsData?.length > 0 && (
        <div className="data-results">
          <div className="data-results-details">
            About {resultsData?.length} results (
            {convertMilisecondsToSeconds(performenceTime)})
          </div>
          {(resultsData ?? []).map((item) => {
            return (
              <div key={item?.id} className="one-data">
                <a href={item?.url}>
                  <div className="one-data-url">{item?.url}</div>
                </a>
                <a href={item?.url}>
                  <div className="one-data-title">{item?.title}</div>
                </a>
                <div className="one-data-description">{item?.description}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GoogleSearch;
