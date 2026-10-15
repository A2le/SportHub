export function readCanRegister(data: unknown): boolean {
  if (
    typeof data === "object" &&
    data !== null &&
    "canRegister" in data &&
    typeof data.canRegister === "boolean"
  ) {
    return data.canRegister;
  }

  throw new Error(
    "Unexpected CheckCanRegister response format."
  );
}