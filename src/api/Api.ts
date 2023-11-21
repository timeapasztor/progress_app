export default class Api {
  public static fetchRandomFact = async () => {
    return await Api?.fetch(`${Url.fetchRandomFact}`);
  };

  private static fetch = async (url: string) => {
    try {
      const response = await fetch(url);
      return await response.json();
    } catch (exception) {
      console.error("Failed to fetch.", exception);
      return "401";
    }
  };
}

export const Url = {
  fetchRandomFact: "https://uselessfacts.jsph.pl/api/v2/facts/random",
};
