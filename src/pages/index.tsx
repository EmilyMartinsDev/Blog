import { GetStaticProps } from 'next'
import { getPrismicClient } from '../services/prismic'
import Prismic from '@prismicio/client';
import Head from 'next/head'
import styles from '../styles/home.module.scss'
import Image from 'next/image'
import techsImage from '../../public/images/techs.svg'
import {RichText} from 'prismic-dom'


type Content = {
  title: string;
  titleContent: string;
  linkAction: string;
  mobileTitle: string;
  mobileContent: string;
  mobileBanner: string;
  webTitle: string;
  webContent: string;
  webBanner: string;
}

interface ContentProps{
  content: Content
}


export default function Home({content}: ContentProps) {
  console.log(content)
  return (
    <>
      <Head>
        <title>Apaixonado por tecnologia - Sujeito Programador</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.containerHeader}>
          <section className={styles.content}>
            <h1>{content.title}</h1>
            <span>{content.titleContent}</span>

            <a href={content.linkAction}>
              <button>Começar agora </button>
            </a>
          </section>

          <img src='/images/banner-conteudos.png' alt='Conteudos Sujeito programador'></img>
        </div>
        <hr className={styles.divisor} />

        <div className={styles.containerMobile}>
          <section className={styles.contentMobile}>
            <h2>{content.mobileTitle}</h2>
            <span>
              {content.mobileContent}
            </span>
          </section>

          <img src={content.webBanner}></img>
        </div>

        <hr className={styles.divisor} />
        <div className={styles.containerMobile}>
        <img src='/images/webDev.png'></img>
          <section className={styles.contentMobile}>
            <h2>{content.webTitle}</h2>
            <span>
             {content.webContent}
            </span>
          </section>
        </div>

  
          <section className={styles.footerContent}>
            <Image src={techsImage} alt="tecnologias"/>

            <h2>Mais de<span className={styles.alunos}>15mil</span> ja levaram sua carreira para o próximo nível</h2>
            <span>E você vai perder essa chance de evoluir de uma vez por todas?</span>
            <a href={content.linkAction}>
              <button>Acessar Turma!</button>
            </a>
          </section>



      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async()=>{
const prismic = getPrismicClient();

const response = await prismic.query([
  Prismic.Predicates.at('document.type', 'home')
])
//console.log(response.results[0].data)

const {
  title, sub_title, link_action, mobile, mobile_content, mobile_banner, title_web, web_content, web_banner
} = response.results[0].data

const content = {
  title: RichText.asText(title),
  titleContent: RichText.asText(sub_title),
  linkAction: link_action.url,
  mobileTitle: RichText.asText(mobile),
  mobileContent: RichText.asText(mobile_content),
  mobileBanner: mobile_banner.url,
  webTitle: RichText.asText(title_web),
  webContent: RichText.asText(web_content),
  webBanner: web_banner.url,
}

  return {
    props:{
      content
    },
    revalidate: 60 * 2
  }
}