export const social = [
  { url: "mailto:qozeemmonsurudeen@gmail.com", name: "mail" },
  { url: "https://github.com/horlas08", name: "github" },
  { url: "https://github.com/horlas08", name: "linkedin" },
] as const satisfies { url: string; name: "mail" | "github" | "instagram" | "linkedin" | "x" }[];
