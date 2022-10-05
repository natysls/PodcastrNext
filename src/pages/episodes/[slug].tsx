import { GetStaticPaths, GetStaticProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
//import { useRouter } from 'next/router';

import { api } from '../../services/api';
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { convertDurationTimeString } from "../../utils/convertDurationToTimeString";
import { usePlayer } from '../../contexts/PlayerContext';

import styles from './episode.module.scss';

//Slug é qualquer coisa que estiver depois de episode/... ,pode ser ajnduadh
//O next tem o sistema de roteamente automático dentro da pasta pages

type Episode = {
  id: string;
  title: string;
  thumbnail: string;
  members: string;
  duration: number;
  durationAsString: string;
  url: string;
  publishedAt: string;
  description: string;
};

type EpisodeProps = {
  episode: Episode;
};

export default function Episode({ episode }: EpisodeProps) {
  //tudo q digita la em cima, aparece na tela
  // const router = useRouter(); {router.query.slug}
  //so vai mostrar as informações somente quando o usuario acessar ela

  const { play } = usePlayer();

  return (    
    <div className={styles.episode}>
      {/* Cabeçalho do html */}
      <Head>
        <title>{episode.title} | Podcastr</title>
      </Head>

      <div className={styles.thumbnailContainer}>
        <Link href="/">
          <button>
            <img src="/arrow-left.svg" alt="Voltar"/>
          </button>
        </Link>
        
        <Image 
          width={700} 
          height={160} 
          src={episode.thumbnail}
          objectFit="cover"
        />

        <button type="button" onClick={ () => play(episode) }>
          <img src="/play.svg" alt="Tocar episódio"/>
        </button>
      </div>

      <header>
        <h1>{episode.title}</h1>
        <span>{episode.members}</span>
        <span>{episode.publishedAt}</span>
        <span>{episode.duration}</span>
      </header>

      {/* Forçar a vir estilizado o html */}
      <div 
        className={styles.description} 
        dangerouslySetInnerHTML={{__html: episode.description}}
      />
    </div>
  )
}

//Obrigatório ser ultilizado em toda rota q usa getStaticProps e que tem parâmetros dinâmicos
// Quais episodios quero gerar estatico no momento da build
export const getStaticPaths: GetStaticPaths = async ()=> {
  //buscar os episodios mais acessados para deixá-los estaticos, não precisamos do total estático, 
  //gera depois de forma incremental.
  
  const { data } = await api.get('episodes', {
    params: {
      _limit: 2,
      _sort: 'published_at',
      _order: 'desc'
    }
  })

  const paths = data.map(episode => {
    return {
      params: {
        slug: episode.id
      }
    }
  })
  
  return {
      paths:[],
      //Se o paths estiver vazio, no yarn build o next não vai gerar nenhum episodio de forma estatica,
      //o q determina o comportamento de uma pagina é o fallback: { 'false'= retorna 404, 'true'= vai 
      //tentar buscar o episodio pelo client(browser), 'blocking'= so vai acessar a tela qnd os dados 
      //da pag estiverem carregados }
      fallback: 'blocking'
  }
  

  //incremental static regeneration
}
//
export const getStaticProps: GetStaticProps = async (ctx) => {
  const {slug} = ctx.params;

  const {data} = await api.get(`/episodes/${slug}`);

  const episode = {
    id: data.id,
    title: data.title,
    thumbnail: data.thumbnail,
    members: data.members,
    publishedAt: format(parseISO(data.published_at), 'd MMM yy', { locale: ptBR }),
    duration: Number(data.file.duration),
    durationAsString: convertDurationTimeString(Number(data.file.duration)),
    description: data.description,
    url: data.file.url
  }

  return {
    props: {
      episode,
    },
    revalidate: 60 * 60 * 24, //24 horas
  }
}