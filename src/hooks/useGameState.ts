import { useCallback, useState } from "react";

export interface GameState {
  health: number;
  score: number;
  ready: boolean;

  board: { 
    state: Tile[][] | null;
    size: number;
    hoveredTile: string | null; 
  }
}

interface Tile {
  id: string;
  contains?: Bomb;
  num?: number;
  onHover?: (id: string) => void;
  state: "open" | "closed";
  style: React.CSSProperties;
}

interface Bomb {
  name: string;
  onDetonate: (tid: string) => void;
}

const defaultState: GameState = {
  health: 100,
  score: 0,
  ready: false,

  board: {
    state: null,
    size: 9,
    hoveredTile: null
  }
};


export function useGameState() {
  const [gs, setGs] = useState<GameState>(defaultState);

  const resetGamestate = useCallback(() => {
    setGs(defaultState);
  }, []);

  const setHealth = useCallback((h: number) => {
    setGs(prev => ({ ...prev, health: h }));
  }, []);

  const damage = useCallback((dmg: number) => {
    if (gs.health - dmg < 0) setGs(prev => ({ ...prev, health: 0 }));
    else setGs(prev => ({ ...prev, health: prev.health - dmg }));
  }, [gs.health]);

  const heal = useCallback((amt: number) => {
    if (gs.health + amt > 100) setGs(prev => ({ ...prev, health: 100 }));
    else setGs(prev => ({ ...prev, health: prev.health + amt }));
  }, [gs.health]);

  const setScore = useCallback((s: number) => {
    setGs(prev => ({ ...prev, score: s }));
  }, []);

  const incrementScore = useCallback((amt: number) => {
    setGs(prev => ({ ...prev, score: prev.score + amt }));
  }, []);

  const setBoardState = useCallback((s: Tile[][]) => {
    setGs(prev => ({ ...prev, board: { ...prev.board, state: s } }));
  }, []);

  const setTileState = useCallback((id: string, newTile: Tile) => {
    setGs(prev => {
      if (!prev.board.state) return prev;

      const updatedBoard = prev.board.state.map(row =>
        row.map(tile =>
          tile.id === id ? { ...tile, ...newTile } : tile
        )
      );

      return {
        ...prev,
        board: {
          ...prev.board,
          state: updatedBoard
        }
      };
    });
  }, []);

  const getTileState = useCallback(
    (id: string): { tile: Tile; row: number; col: number } | null => {
      const board = gs.board.state;
      if (!board) return null;

      for (let r = 0; r < board.length; r++) {
        for (let c = 0; c < board[r].length; c++) {
          if (board[r][c].id === id) {
            return { tile: board[r][c], row: r, col: c };
          }
        }
      }

      return null;
    },
    [gs.board.state]
  );

  const getRawTileState = useCallback((id: string) => {
    const flat = gs.board.state?.flat();
    return flat?.find(t => t.id === id) ?? null;
  }, [gs.board.state]);

  const setTileContains = useCallback((id: string, contains?: Bomb) => {
    const ts = getRawTileState(id);
    if (!ts) return;

    setTileState(id, { ...ts, contains: contains });
  }, [setTileState, getRawTileState]);

  const setTileNum = useCallback((id: string, num?: number) => {
    const ts = getRawTileState(id);
    if (!ts) return;

    setTileState(id, { ...ts, num: num });
  }, [setTileState, getRawTileState]);

  const setTileOpenState = useCallback((id: string, state: "open" | "closed") => {
    const ts = getRawTileState(id);
    if (!ts) return;

    setTileState(id, { ...ts, state: state });
  }, [setTileState, getRawTileState]);

  const setTileOnHover = useCallback((id: string, onHover: (id: string) => void) => {
    const ts = getRawTileState(id);
    if (!ts) return;

    setTileState(id, { ...ts, onHover: onHover });
  }, [setTileState, getRawTileState]);
}