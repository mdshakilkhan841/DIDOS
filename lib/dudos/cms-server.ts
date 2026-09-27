import { mergeContent, initialContent } from "./cms-model";

export async function getPublicContent() {
  try {
    return mergeContent([]);
  } catch {
    return structuredClone(initialContent);
  }
}
