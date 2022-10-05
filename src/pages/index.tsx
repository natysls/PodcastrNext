import { GetStaticProps } from "next";
import Image from 'next/image';
import Head from 'next/head';
import Link from 'next/link';
//import { useEffect } from 'react';

import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { api } from "../services/api";
import { convertDurationTimeString } from "../utils/convertDurationToTimeString";
import { usePlayer } from "../contexts/PlayerContext";

import styles from './home.module.scss';

type Episode = { //Tipagem de um episodio
  id: string;
  title: string;
  thumbnail: string;
  members: string;
  duration: number;
  durationAsString: string;
  url: string;
  publishedAt: string;
}

//array de episodes
type HomeProps = {
  latestEpisodes: Episode[];
  allEpisodes: Episode[]
}

export default function Home({ latestEpisodes, allEpisodes }: HomeProps) {
  const { playList } = usePlayer();

  //"..." são todos os episodios
  const episodeList = [...latestEpisodes, ...allEpisodes];
  
  return (
    <div className={styles.homePage}>
      {/* Cabeçalho do html */}
      <Head>
        <title>Home | Podcastr</title>
      </Head>

      <section className={styles.latestEpisodes}>
        <h2>Últimos lançamentos</h2>

        <ul>
          {latestEpisodes.map((episode, index) => {
            return ( //O primeiro elemento q vem dentro do map precisa ter um key
              <li key={episode.id}>
                <div style={{width: 100}}>
                  <Image 
                    width={192} 
                    height={192} 
                    src={episode.thumbnail} 
                    alt={episode.title} 
                    objectFit="cover"
                  />
                </div>
                
                <div className={styles.episodeDetails}>
                  <Link href={`/episodes/${episode.id}`}>
                    <a>{episode.title}</a>
                  </Link>
                  <p>{episode.members}</p>
                  <span>{episode.publishedAt}</span>
                  <span>{episode.durationAsString}</span>
                </div>

                <button type="button" onClick={()=> playList(episodeList, index)}>
                  <img src="/play-green.svg" alt="Tocar episódio" />
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <section className={styles.allEpisodes}>
        <h2>Todos episódios</h2>

        <table cellSpacing={0}>
          <thead>
            <tr>
              <th></th>
              <th>Podcastr</th>
              <th>Integrantes</th>
              <th>Data</th>
              <th>Duração</th>
              <th></th>
            </tr>               
          </thead>

          <tbody>
            {allEpisodes.map((episode, index) =>{
              return (
                <tr key={episode.id}>
                  <td style={{width: 72}}>
                    <Image 
                      width={120} 
                      height={120} 
                      src={episode.thumbnail} 
                      alt={episode.title} 
                      objectFit="cover"
                    />
                  </td>

                  <td>
                    <Link href={`/episodes/${episode.id}`}>
                      <a>{episode.title}</a>
                    </Link>
                  </td>

                  <td>{episode.members}</td>
                  <td style={{width: 100}}>{episode.publishedAt}</td>
                  <td>{episode.durationAsString}</td>

                  <td>
                    {/* o priemiro item dele vai iniciar a partir do momento q acabou os 2 priemiros episodios */}
                    <button type="button" onClick={()=> playList(episodeList, index + latestEpisodes.length)}>
                      <img src="/play-green.svg" alt="Tocar episódio"/>
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

      </section>

      {/* <p>{JSON.stringify(props.episodes)}</p> */}
      {/* <p>{new Date(props.episodes[0].published_at).toLocaleDateString}</p> */}
    </div>
  );
}

//SSR - server side rendering e SSG - server side generate
export const getStaticProps: GetStaticProps = async () => {
  const { data } = await api.get('episodes', {
    //objeto de config: retorna 12 registros, ordenar pela data de publicação e em ordem decrescente
    params: {
      _limit: 12,
      _sort: 'published_at',
      _order: 'desc'
    }
  });

  const episodes = data.map(episode => {
    //retornar para cada ep
    return {
      id: episode.id,
      title: episode.title,
      thumbnail: episode.thumbnail,
      members: episode.members,
      publishedAt: format(parseISO(episode.published_at), 'd MMM yy', { locale: ptBR }),
      duration: Number(episode.file.duration),
      durationAsString: convertDurationTimeString(Number(episode.file.duration)),
      url: episode.file.url
    }
  })

  const latestEpisodes = episodes.slice(0, 2);
  const allEpisodes = episodes.slice(2, episodes.length)

  return {
    props: {
      latestEpisodes,
      allEpisodes
    },
    //A acada 8 horas, irá gerar uma nova requisição
    //Vai apresnetar uma página estática da página
    revalidate: 60 * 60 * 8,
  }

}

  // //SPA 
  // //dispara algo sempre q algo mudar na aplicação. Oq q quero executar e quando. Se tiver so [] so executa uma vez
  // useEffect(()=> {
  //   fetch('http://localhost:3333/episodes')
  //   .then(response => response.json())
  //   .then(data=> console.log(data));
  // }, [])

