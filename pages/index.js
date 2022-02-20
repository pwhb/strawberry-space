import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import Link from "next/link";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Avatar, Button, Flex, HStack, Divider } from "@chakra-ui/react";

import Layout from "../components/layout";
import Banner from "../components/banner";

import { getSession } from "next-auth/react";
import axios from "axios";
import ListingItem from "../components/listingItem";

export async function getServerSideProps(ctx) {
  const { locale } = ctx;

  const forSale = await axios.get(
    "http://localhost:3000/api/listings?purpose=sale"
  );
  const forRent = await axios.get(
    "http://localhost:3000/api/listings?purpose=rent"
  );
  // console.log("forSale", forSale.data);
  // console.log("forRent", forRent.data);
  return {
    props: {
      forSaleListings: forSale.data,
      forRentListings: forRent.data,
      session: await getSession(ctx),
      ...(await serverSideTranslations(locale, [
        "home",
        "common",
        "new-listing",
      ])),
    },
  };
}
export default function Home({ forSaleListings, forRentListings }) {
  const { t } = useTranslation("home");
  console.log(forSaleListings);
  console.log(forRentListings);
  return (
    <Layout title="Strawberries Space">
      <Banner
        purpose={t("rent.purpose")}
        title={t("rent.title")}
        desc={t("rent.desc")}
        buttonText={t("rent.buttonText")}
        linkName="/search?purpose=rent"
        imageUrl="https://cdn.pixabay.com/photo/2021/11/08/00/30/bedroom-6778193_960_720.jpg"
      />
      <HStack spacing={5} wrap={"wrap"} maxW={"7xl"} mx={"auto"} px={"auto"}>
        {forSaleListings &&
          forSaleListings.map((listing) => (
            <ListingItem listing={listing} key={listing._id} />
          ))}
      </HStack>
      <Divider my={10} />
      <Banner
        purpose={t("buy.purpose")}
        title={t("buy.title")}
        desc={t("buy.desc")}
        buttonText={t("buy.buttonText")}
        linkName="/search?purpose=buy"
        imageUrl="https://cdn.pixabay.com/photo/2017/01/07/17/48/interior-1961070_960_720.jpg"
        right={true}
      />
      <HStack spacing={5} wrap={"wrap"} maxW={"7xl"} mx={"auto"} px={"auto"}>
        {forRentListings &&
          forRentListings.map((listing) => (
            <ListingItem listing={listing} key={listing._id} />
          ))}
      </HStack>
      <Divider my={10} /> 
      <Banner
        purpose={t("sell.purpose")}
        title={t("sell.title")}
        desc={t("sell.desc")}
        buttonText={t("sell.buttonText")}
        linkName="/create-new-listing"
        imageUrl="https://cdn.pixabay.com/photo/2017/03/22/17/39/kitchen-2165756_960_720.jpg"
      />
    </Layout>
  );
}

export const ToggleLanguage = () => {
  const router = useRouter();
  const { pathname, asPath, query } = router;
  return (
    <Button
      onClick={() =>
        router.push({ pathname, query }, asPath, {
          locale: router.locale === "en" ? "my" : "en",
        })
      }
      variant={"outline"}
      // href={router.locale === "en" ? router.asPath : `en/${router.asPath}`}
      // locale={false}
    >
      {router.locale === "en" ? (
        <Avatar size={"2xs"} src={"/images/my.svg"} />
      ) : (
        <Avatar size={"2xs"} src={"/images/en.svg"} />
      )}
    </Button>
  );
};

// export const ToggleLanguageMenuItem = () => {
//   const router = useRouter();
//   const { t } = useTranslation();
//   return <MenuItem icon={<ToggleLanguage />}>{t("search")}</MenuItem>;
// };

export const LocalizedLink = ({ href, children }) => {
  const router = useRouter();
  return (
    <Link passHref href={href} locale={router.locale}>
      {children}
    </Link>
  );
};
