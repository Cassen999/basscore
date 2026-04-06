import { useEffect, useState } from "react";
import lookupWord from "../services/dictionaryService";
import { useDebounce } from "./useDebounce";

const useDictionary = (word: string) => {
  const [definition, setDefinition] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);
  const debouncedWord = useDebounce(word, 300);

  useEffect(() => {
    if (!debouncedWord) return;
    setIsLoading(true);

    lookupWord(debouncedWord)
      .then(setDefinition)
      .catch(setError)
      .finally(() => setIsLoading(false));
    }, [debouncedWord]);
    
    return { definition, isLoading, error };
};

export default useDictionary;
