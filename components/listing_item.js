import {
  Box,
  Flex,
  Image,
  Text,
  Tag,
  Link,
  Stack,
  Divider,
  HStack,
  useColorModeValue,
  GridItem,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import {
  FaBed,
  FaBath,
  FaHome,
  FaBuilding,
  FaRulerCombined,
} from "react-icons/fa";
import { useTranslation } from "next-i18next";
import { numInBurmese, formatPrice } from "../lib/formatters";
import { LocalizedLink } from "../pages/index";
const ListingItem = ({
  listing: {
    _id,
    title,
    category,
    images,
    price,
    purpose,
    bedrooms,
    bathrooms,
    width,
    length,
    lot_width,
    lot_length,
  },
}) => {
  const { t } = useTranslation("listing");
  const { locale } = useRouter();
  const area = lot_width ? lot_width * lot_length : width * length;
  return (
    <GridItem
      as={"button"}
      w={{ base: "auto", md: 400 }}
      direction={"column"}
      boxShadow={"lg"}
      bg={useColorModeValue("pink.50", "gray.900")}
      p={3}
      // justifyItems={"center"}
    >
      <LocalizedLink href={`/properties/${_id}`}>
        <Box align={"center"} w={"full"}>
          <Image
            src={images[0] ? images[0] : "/images/placeholder.svg"}
            alt={title}
            w={400}
            objectFit={"contain"}
            h={240}
          />
          <Text fontWeight={"semibold"} my={3}>
            {title.length > 48 ? title.substring(0, 48) + "..." : title}
          </Text>

          <HStack spacing={5} justifyContent={"center"} my={3}>
            <Text as={"span"}>
              {category === "condo" || category === "apartment" ? (
                <FaBuilding />
              ) : (
                <FaHome />
              )}
            </Text>
            <Tag colorScheme={purpose === "rent" ? "yellow" : "green"}>
              {t(`purpose.${purpose}`).toUpperCase()}
            </Tag>{" "}
            <Text fontWeight={"bold"} color={"red.400"} as={"span"}>
              {formatPrice(price.value, locale)}{" "}
              {t(`currency.${price.currency}`)}
            </Text>
          </HStack>

          <HStack
            spacing={5}
            justifyContent={"center"}
            mb={3}
            color={"blue.400"}
            fontWeight={"semibold"}
          >
            <Text>{locale === "en" ? bathrooms : numInBurmese(bedrooms)}</Text>
            <FaBed />
            <Divider orientation="vertical" />
            <Text>{locale === "en" ? bathrooms : numInBurmese(bathrooms)}</Text>
            <FaBath />
            <Divider orientation="vertical" />
            <Text>
              {locale === "en" ? area : numInBurmese(area)} {t("units.sqft")}
            </Text>
            <FaRulerCombined />
          </HStack>
        </Box>
      </LocalizedLink>
    </GridItem>
  );
};

export default ListingItem;
