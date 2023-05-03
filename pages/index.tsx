import Head from "next/head";
import React from "react";
import { GetServerSideProps } from "next";
import { renderToString } from "react-dom/server";
import algoliasearch from "algoliasearch/lite";
import { Hit as AlgoliaHit } from "instantsearch.js";
import {
  DynamicWidgets,
  InstantSearch,
  Hits,
  Highlight,
  RefinementList,
  SearchBox,
  InstantSearchServerState,
  InstantSearchSSRProvider,
} from "react-instantsearch-hooks-web";
import { getServerState } from "react-instantsearch-hooks-server";
import { createInstantSearchRouterNext } from "react-instantsearch-hooks-router-nextjs";
import singletonRouter from "next/router";
import { Panel } from "../components/Panel";

const client = algoliasearch("2YYVBQESNN", "c2a5ba8bc1abfcd46ec7f06cd2811ee1");

type HitProps = {
  hit: AlgoliaHit<{
    name: string;
    prix: number;
  }>;
};

function Hit({ hit }: HitProps) {
  console.log("hit", hit);
  return (
    <>
      <Highlight hit={hit} attribute="nom" className="Hit-label" />
      <span className="Hit-price">{hit.prix}€</span>
    </>
  );
}

type HomePageProps = {
  serverState?: InstantSearchServerState;
  url?: string;
};

export default function HomePage({ serverState, url }: HomePageProps) {
  return (
    <InstantSearchSSRProvider {...serverState}>
      <Head>
        <title>React InstantSearch Hooks - Next.js</title>
      </Head>

      <InstantSearch
        searchClient={client}
        indexName="prod_TempsL_TLFR"
        routing={{
          router: createInstantSearchRouterNext({
            serverUrl: url,
            singletonRouter,
          }),
        }}
      >
        <div className="Container">
          <div>
            <DynamicWidgets fallbackComponent={FallbackComponent} />
          </div>
          <div>
            <SearchBox />
            <Hits hitComponent={Hit} />
          </div>
        </div>
      </InstantSearch>
    </InstantSearchSSRProvider>
  );
}

function FallbackComponent({ attribute }: { attribute: string }) {
  return (
    <Panel header={attribute}>
      <RefinementList attribute={attribute} />
    </Panel>
  );
}

export const getServerSideProps: GetServerSideProps<HomePageProps> =
  async function getServerSideProps({ req }) {
    const protocol = req.headers.referer?.split("://")[0] || "https";
    const url = `${protocol}://${req.headers.host}${req.url}`;
    const serverState = await getServerState(<HomePage url={url} />, {
      renderToString,
    });

    console.log(
      "serverState",
      serverState.initialResults.instant_search.results
    );

    return {
      props: {
        serverState,
        url,
      },
    };
  };
