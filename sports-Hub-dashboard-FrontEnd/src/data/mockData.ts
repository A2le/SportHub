
export interface Tournament {
  id: string;
  name: string;
  sport: string;
  date: string;
  venue: string;
  ageGroups: string[];
  totalTeams: number;
  registeredTeams: number;
  pitches: number;
  status: "Registration Open" | "Draft" | "Upcoming" | "Completed";
  image: string;
}

export const tournaments: Tournament[] = [
  {
    id: "football-festival",
    name: "Gauteng Schools Football Festival",
    sport: "Football",
    date: "2026-11-15",
    venue: "TUT Sports Grounds",
    ageGroups: ["U13", "U15"],
    totalTeams: 8,
    registeredTeams: 6,
    pitches: 1,
    status: "Registration Open",
    image:
      "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "youth-rugby-cup",
    name: "Pretoria Youth Rugby Cup",
    sport: "Rugby",
    date: "2026-11-22",
    venue: "Pretoria",
    ageGroups: ["U15"],
    totalTeams: 12,
    registeredTeams: 4,
    pitches: 2,
    status: "Draft",
    image:
      "https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "athletics-meet",
    name: "Gauteng Schools Athletics Meet",
    sport: "Athletics",
    date: "2026-12-05",
    venue: "Johannesburg",
    ageGroups: ["U13", "U15"],
    totalTeams: 16,
    registeredTeams: 10,
    pitches: 0,
    status: "Upcoming",
    image:
      "https://images.unsplash.com/photo-1533561052604-c3beb6d55b8d?auto=format&fit=crop&w=900&q=80",
  },
];
