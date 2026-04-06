import useDictionary from "../hooks/useDictionary";
import type { iDictionary } from "../types/types";

export const DictionaryPanel = (props: iDictionary) => {
  const { word } = props;
  const { definition, isLoading, error } = useDictionary(word);

  console.log('def', definition);
  console.log('isLoading', isLoading);
  console.log('error', error);
  return <>hello</>;
};