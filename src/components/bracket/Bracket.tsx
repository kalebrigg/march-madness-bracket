"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Tournament, Matchup, Prediction, GameOdds } from "@/lib/types";
import { Region } from "./Region";
import { FinalFour } from "./FinalFour";
import { GameDetailDialog } from "../game-detail/GameDetailDialog";

interface BracketProps {
  tournament: Tournament;
  predictions: Record<string, Prediction>;
  odds: Record<string, GameOdds>;
}

export function Bracket({ tournament, predictions, odds }: BracketProps) {
  const [selectedGame, setSelectedGame] = useState<Matchup | null>(null);

  const handleMatchClick = (matchup: Matchup) => {
    if (matchup.teams[0] || matchup.teams[1]) {
      setSelectedGame(matchup);
    }
  };

  const leftRegions = tournament.regions.slice(0, 2);
  const rightRegions = tournament.regions.slice(2, 4);

  return (
    <>
      {/* Desktop: Full horizontal bracket */}
      <div className="hidden lg:flex items-stretch gap-8 overflow-x-auto pb-4 bracket-print-container">
        {/* Left side regions */}
        <div className="flex flex-col gap-6">
          {leftRegions.map((region) => (
            <Region
              key={region.name}
              region={region}
              predictions={predictions}
              onMatchClick={handleMatchClick}
            />
          ))}
        </div>

        {/* Final Four center */}
        <FinalFour
          finalFourGames={tournament.finalFour}
          championship={tournament.championship}
          predictions={predictions}
          onMatchClick={handleMatchClick}
        />

        {/* Right side regions (reversed) */}
        <div className="flex flex-col gap-6">
          {rightRegions.map((region) => (
            <Region
              key={region.name}
              region={region}
              predictions={predictions}
              onMatchClick={handleMatchClick}
              reverse
            />
          ))}
        </div>
      </div>

      {/* Mobile/Tablet: Tabbed view */}
      <div className="lg:hidden">
        <Tabs defaultValue={tournament.regions[0]?.name ?? "South"}>
          <TabsList className="w-full flex mb-4">
            {tournament.regions.map((region) => (
              <TabsTrigger key={region.name} value={region.name} className="flex-1 text-xs">
                {region.name}
              </TabsTrigger>
            ))}
            <TabsTrigger value="final-four" className="flex-1 text-xs">
              Final 4
            </TabsTrigger>
          </TabsList>

          {tournament.regions.map((region) => (
            <TabsContent key={region.name} value={region.name}>
              <div className="overflow-x-auto pb-4">
                <Region
                  region={region}
                  predictions={predictions}
                  onMatchClick={handleMatchClick}
                />
              </div>
            </TabsContent>
          ))}

          <TabsContent value="final-four">
            <FinalFour
              finalFourGames={tournament.finalFour}
              championship={tournament.championship}
              predictions={predictions}
              onMatchClick={handleMatchClick}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Game Detail Dialog */}
      <GameDetailDialog
        matchup={selectedGame}
        prediction={selectedGame ? predictions[selectedGame.gameId] ?? null : null}
        odds={selectedGame ? odds[selectedGame.gameId] ?? null : null}
        onClose={() => setSelectedGame(null)}
      />
    </>
  );
}
