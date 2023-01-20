import styles from './styles.module.scss';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { FiChevronLeft, FiChevronsLeft, FiChevronsRight, FiChevronRight } from 'react-icons/fi'
import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import { getPrismicClient } from '../../services/prismic'
import { RichText } from 'prismic-dom';
import { useState } from 'react';

type Post = {
    slug: string;
    title: string;
    description: string;
    cover: string;
    updatedAt: string;
}

interface PostsProps {
    posts: Post[],
    page: string,
    totalPage: string
}


export default function Posts({ posts: postsBlog, page, totalPage }: PostsProps) {

    const [posts, setPosts] = useState(postsBlog || []);
    const[currentPage, setCurrentPage] = useState(Number(page))

    //buscar novos posts
    async function reqPost(pageNumber: Number){
        const prismic = getPrismicClient();
        const response = await prismic.query([
            Prismic.predicates.at('document.type', 'post')
        ], {
            orderings: '[document.last_publication_date desc]',
            fetch: ['title.post', 'description.post', 'cover.post'],
            pageSize: 3,
            page: String(pageNumber)
        })

        return response
    }


async function navigatePage(pageNumber: Number){
    const response = await reqPost(pageNumber)

    if(response.results.length === 0){
        return;
    }

    const getPosts: any = response.results.map((post) => {
        return {
            slug: post.uid,
            title: RichText.asText(post.data.title),
            description: post.data.description.find((content : any) => content.type === 'paragraph')?.text ?? '',
            cover: post.data.cover.url,
            updatedAt: new Date(post.last_publication_date || '').toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            })
        }
    })

    setCurrentPage(Number(pageNumber))
    setPosts(getPosts) 

}


    return (
        <>
            <Head>
                <title>Blog | Sujeito Programador</title>
            </Head>

            <main className={styles.container}>
                <div className={styles.posts}>
                    {posts.map((post) => (
                        <Link href={`/posts/${post.slug}`} key={post.slug} legacyBehavior>
                            <a key={post.slug}>
                                <Image src={post.cover} alt={post.title} width={720} height={410} quality={100} 
                                placeholder='blur' blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg==" />

                                <strong>{post.title}</strong>
                                <time>{post.updatedAt}</time>

                                <p> {post.description}
                                </p>
                            </a>
                        </Link>






                    ))}
                    <div className={styles.buttonNavigate}>
                      {Number(currentPage)>= 2 && (
                        <div>
                          <button onClick={()=> navigatePage(1)}>
                              <FiChevronsLeft size={25} color="#FFF" />
                          </button>
                          <button onClick={()=> navigatePage(Number(currentPage - 1))}>
                              <FiChevronLeft size={25} color="#FFF" />
                          </button>
                      </div>

                      )}
                       {Number(currentPage) < Number(totalPage) && (
                     <div>
                         <button onClick={()=> navigatePage(Number(currentPage + 1))}>
                             <FiChevronRight size={25} color="#FFF" />
                         </button>
                         <button onClick={()=> navigatePage(Number(totalPage))}>
                             <FiChevronsRight size={25} color="#FFF" />
                         </button>
                     </div>
                       )}

                    </div>

                </div>


            </main>

        </>
    )
}

export const getStaticProps: GetStaticProps = async () => {
    const prismic = getPrismicClient();
    const response = await prismic.query([
        Prismic.Predicates.at('document.type', 'post')
    ], {
        orderings: '[document.last_publication_date desc]',
        fetch: ['title.post', 'description.post', 'cover.post'],
        pageSize: 3,
    })

    //console.log(JSON.stringify(response, null, 2))

    const posts = response.results.map((post) => {
        return {
            slug: post.uid,
            title: RichText.asText(post.data.title),
            description: post.data.description.find((content : any) => content.type  === 'paragraph')?.text ?? '',
            cover: post.data.cover.url,
            updatedAt: new Date(post.last_publication_date || '').toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            })
        }
    })

    return {

        props: {
            posts,
            page: response.page,
            totalPage: response.total_pages
        },
        revalidate: 60 * 30
    }
}