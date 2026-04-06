import axios from "axios";

const lookupWord = async (word: string) => {
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;

  const res = await axios.get(url);

  return res.data;
};

export default lookupWord;
