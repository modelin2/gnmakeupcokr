import { SearchBar } from "../SearchBar";

export default function SearchBarExample() {
  return (
    <div className="max-w-md">
      <SearchBar onSearch={(q) => console.log("Searching:", q)} />
    </div>
  );
}
