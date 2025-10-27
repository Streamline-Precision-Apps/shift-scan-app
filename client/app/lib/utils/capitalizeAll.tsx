export default function CapitalizeAll(str: string): string {
  if (typeof str !== "string") return "";
  const lowercaseWords = ["de", "del"];

  // Split the string into words, capitalize each word, then join them back with a space
  return str
    .split(" ") // Split by spaces to get words
    .map((word) => {
      // Check if the word is in the list of words to keep lowercase
      if (lowercaseWords.includes(word.toLowerCase())) {
        return word.toLowerCase(); // Return the word in lowercase
      }
      // Otherwise, capitalize the word
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" "); // Join words back into a single string
}
