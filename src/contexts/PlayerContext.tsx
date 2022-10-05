import { createContext, useState, ReactNode, useContext } from 'react';

type Episode = {
  title: string;
  thumbnail: string;
  members: string;
  duration: number;
  url: string;
};

type PlayerContextData = {
  episodeList: Episode[];
  currentEpisodeIndex: number; //indice do episodio atual
  isPlaying: boolean;
  isLooping: boolean;
  isShuffling: boolean;
  play: (episode: Episode) => void;
  playList: (list: Episode[], index: number) => void;
  playNext:() => void;
  playPrevious:() => void;
  clearPlayerState: () => void;
  togglePlay: () => void;
  toggleLoop: () => void;
  toggleShuffle: () => void;
  setPlayingState: (state:boolean)=> void;
  hasNext: boolean;
  hasPrevious: boolean;
};

//valor do formato padrão, botei string
export const PlayerContext = createContext({} as PlayerContextData);
//formato dos dados do PlayerContext é do tipo PlayerContextData

type PlayerContextProviderProps = {
  children: ReactNode; //qualquer elemento react
}

export function PlayerContextProvider({ children }: PlayerContextProviderProps){
  const [episodeList, setEpisodeList] = useState([]);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);

  function play(episode: Episode) {
    setEpisodeList([episode]); //array de episode
    setCurrentEpisodeIndex(0); //forçar o valor 0
    setIsPlaying(true);
  }

  //lista de 12 episodios, mas quero o episodio 6
  function playList(list: Episode[], index: number){
    setEpisodeList(list);
    setCurrentEpisodeIndex(index);
    setIsPlaying(true);
  }

  //Play e pause da tela do player
  function togglePlay(){
    setIsPlaying(!isPlaying);
  }

  function toggleLoop(){
    setIsLooping(!isLooping);
  }

  function toggleShuffle(){
    setIsShuffling(!isShuffling);
  }

  //Play e pause do teclado
  function setPlayingState(state: boolean){
    setIsPlaying(state);
  }

  function clearPlayerState(){
    setEpisodeList([]);
    setCurrentEpisodeIndex(0);
  }

  const hasNext = isShuffling || (currentEpisodeIndex + 1) < episodeList.length;
  const hasPrevious = currentEpisodeIndex > 0;
  
  function playNext(){
    if(isShuffling){
      //se estiver em modo shuffle
      const nextRandomEpisodeIndex = Math.floor(Math.random() * episodeList.length);
      setCurrentEpisodeIndex(nextRandomEpisodeIndex);
    }else if(hasNext){
      // enquanto o indice estiver menor do q o tamanho da lista, ele vai setar mais uma posição do indice atual
      setCurrentEpisodeIndex(currentEpisodeIndex + 1);
    }
    
  }

  function playPrevious(){
    //voltar
    if(hasPrevious){
      setCurrentEpisodeIndex(currentEpisodeIndex - 1);
    }
  }

  return (
    <PlayerContext.Provider 
      value={
        { 
          episodeList, 
          currentEpisodeIndex, 
          isPlaying, 
          isLooping,
          isShuffling,
          play, 
          playList,
          playNext,
          playPrevious,
          clearPlayerState,
          togglePlay, 
          toggleLoop,
          toggleShuffle,
          setPlayingState,
          hasNext,
          hasPrevious,
        }
      }
    >
      { children } //Vai passar todo o conteudo da tag pra cá
    </PlayerContext.Provider>
  )
}

export const usePlayer = () => {
  return useContext(PlayerContext);
}