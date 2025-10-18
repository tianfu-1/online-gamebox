export enum BuildLevel {
    Dev = 1,
    Prod,
}

export const Config ={
    GameVersion: "web1.3.1",
    BuildLevel: BuildLevel.Prod,
    AnalyticsEnabled: false,
}