import Layout from "../components/layout";
import {
  Box,
  Stack,
  Heading,
  Text,
  Image,
  Input,
  Button,
  Flex,
  useColorModeValue,
  HStack,
  Select,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  VStack,
  useToast,
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  useDisclosure,
} from "@chakra-ui/react";
import { FaBath, FaBed, FaPhoneAlt } from "react-icons/fa";
import { MdAddAPhoto } from "react-icons/md";
// import { useDropzone } from "react-dropzone";
import Dropzone from "react-dropzone";
import jsonFile from "../public/locales/en/new-listing.json";

import { useState, useCallback, useRef } from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { getSession } from "next-auth/react";
import { CustomInput, GradientButton } from "../components/common";
import { capitalize } from "../lib/helpers";
import { validateForm } from "../lib/validator";
import axios from "axios";

export async function getServerSideProps(ctx) {
  const { locale } = ctx;
  const session = await getSession(ctx);
  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
  return {
    props: {
      ...(await serverSideTranslations(locale, ["new-listing", "common"])),
    },
  };
}

const CreateNewListing = () => {
  const [photos, setPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [phones, setPhones] = useState([""]);
  const [error, setError] = useState({});
  const [formData, setFormData] = useState({
    added_by: "",
    title: "",
    description: "",
    price: 0,
    currency: "mmk",
    purpose: "rent",
    category: "",
    bedrooms: 0,
    bathrooms: 1,
    floor_level: "",
    floor_type: "",
    lat: 0,
    lng: 0,
    home_no: "",
    street: "",
    township: "",
    state: "yangon",
    tags: [],
    status: "",
    width: 0,
    length: 0,
    lot_width: 0,
    lot_length: 0,
  });
  const { t } = useTranslation("new-listing");

  const toast = useToast();
  const generateTitle = () => {
    const {
      location,
      bedrooms,
      bathrooms,
      category,
      price,
      currency,
      purpose,
    } = formData;
    const title = `${capitalize(category)} for ${purpose} at only ${price} ${t(
      `currency.${currency}`
    )}`;
    setFormData({ ...formData, title });
  };

  const onSubmit = async () => {
    setError({});
    const newError = validateForm({ ...formData, phone_numbers: phones });
    setError(newError);
    if (Object.keys(newError).length > 0) {
      toast({
        title: "Failed to post.",
        description: "Please fill the necessary fields first.",
        status: "error",
        isClosable: true,
      });
    } else {
      try {
        setIsLoading(true);
        const { data } = await axios.post("http://localhost:3000/api/upload", {
          photos,
        });
        console.log("data", data);
        
        const images = data.map((image) => image.secure_url);

        const res = await axios.post("http://localhost:3000/api/listings", {
          ...formData,
          phones,
          images,
        });
        setIsLoading(false);
        console.log(res);
      } catch (e) {
        toast({
          title: "Failed to post.",
          description: "Sorry, something went wrong.",
          status: "error",
          isClosable: true,
        });
        setIsLoading(false);
        console.log(e);
      }
    }
  };

  const onChange = (e) => {
    setError({ ...error, [e.target.name]: false });
    if (e.target.name === "state") {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
        township: "",
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]:
          e.target.type === "number"
            ? parseInt(e.target.value)
            : e.target.value,
      });
    }
  };

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      console.log(latitude, longitude);
      setFormData({
        ...formData,
        lat: latitude,
        lng: longitude,
      });
    });
  };

  const removePhoto = (idx) => {
    // console.log("idx", idx);
    setPhotos((prevVal) =>
      prevVal.filter((img, i) => {
        return i !== idx;
      })
    );
  };

  const handleFiles = (files) => {
    files.forEach((val) => {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotos((prevVal) => [...prevVal, reader.result]);
      };
      reader.readAsDataURL(val);
    });
  };

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    handleFiles(acceptedFiles);
  }, []);

  const onChangeInputFiles = (e) => {
    handleFiles(Array.from(e.target.files));
  };

  const fileInput = useRef();

  // const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  return (
    <Layout title={"Create New Listing"}>
      <Box maxW={"4xl"} mx={"auto"} marginTop={20}>
        <Heading
          lineHeight={1.1}
          fontSize={{ base: "3xl", sm: "4xl", md: "5xl", lg: "6xl" }}
        >
          {t("title")}
        </Heading>
        <Stack
          bg={useColorModeValue("pink.50", "gray.900")}
          rounded={"xl"}
          p={{ base: 4, sm: 6, md: 8 }}
          spacing={{ base: 8 }}
        >
          <Stack spacing={4}>
            <Heading
              color={useColorModeValue("gray.800", "gray.200")}
              lineHeight={1.9}
              fontSize={{ base: "2xl", sm: "3xl", md: "3xl" }}
            >
              {t("subtitle")}
              <Text
                as={"span"}
                bgGradient="linear(to-r, red.400,pink.400)"
                bgClip="text"
              >
                !
              </Text>
            </Heading>
          </Stack>
          <Box as={"form"} mt={10} onSubmit={onSubmit}>
            <Stack spacing={10}>
              <HStack alignItems={"end"}>
                <CustomInput
                  isRequired
                  name={"title"}
                  label={t("form.title")}
                  value={formData.title}
                  onChange={onChange}
                  isInvalid={error.title}
                />

                <GradientButton
                  buttonText={t("form.auto-fill")}
                  onClick={generateTitle}
                />
              </HStack>
              <CustomInput
                name={"description"}
                label={t("form.description")}
                value={formData.description}
                onChange={onChange}
                textarea
              />
              <HStack wrap={"wrap"}>
                <FormControl isRequired w={"auto"} isInvalid={error.category}>
                  <FormLabel>{t("form.category")}</FormLabel>
                  <RadioGroup
                    value={formData.category}
                    onChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <HStack spacing={10}>
                      {Object.keys(jsonFile.category).map((category, idx) => (
                        <Radio value={category} key={`${category}-${idx}`}>
                          {t(`category.${category}`)}
                        </Radio>
                      ))}
                    </HStack>
                  </RadioGroup>
                </FormControl>
                {(formData.category === "apartment" ||
                  formData.category === "condo") && (
                  <FormControl isRequired w={"3xs"}>
                    <FormLabel>{t("form.floor_level")}</FormLabel>
                    <Select
                      name={"floor_level"}
                      value={formData.floor_level}
                      onChange={onChange}
                    >
                      {Object.keys(jsonFile.floor_level).map((floor, idx) => (
                        <option value={floor} key={`${floor}-${idx}`}>
                          {t(`floor_level.${floor}`)}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </HStack>
              <HStack wrap={"wrap"}>
                <FormControl w={"auto"} isRequired>
                  <FormLabel>{t("form.purpose")}</FormLabel>
                  <Select
                    name={"purpose"}
                    value={formData.purpose}
                    onChange={onChange}
                  >
                    {Object.keys(jsonFile.purpose).map((purpose, idx) => (
                      <option value={purpose} key={`${purpose}-${idx}`}>
                        {t(`purpose.${purpose}`)}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <CustomInput
                  name={"price"}
                  label={t("form.price")}
                  isRequired
                  w={"auto"}
                  value={formData.price}
                  onChange={onChange}
                  type={"number"}
                  step={formData.purpose === "sell" ? 100000 : 1000}
                  min={formData.purpose === "sell" ? 1000000 : 100000}
                  rightAddon={
                    formData.currency === "mmk"
                      ? t("currency.mmk")
                      : t("currency.usd")
                  }
                  isInvalid={error.price}
                />
                <FormControl w={"auto"} isRequired>
                  <FormLabel>{t("form.currency")}</FormLabel>
                  <Select
                    name={"currency"}
                    value={formData.currency}
                    onChange={onChange}
                  >
                    <option value="mmk">{t("currency.mmk")}</option>
                    <option value="usd">{t("currency.usd")}</option>
                  </Select>
                </FormControl>
              </HStack>
              <HStack alignItems={"end"}>
                <CustomInput
                  isRequired
                  w={"auto"}
                  name={"bedrooms"}
                  label={t("form.bedrooms")}
                  value={formData.bedrooms}
                  onChange={onChange}
                  icon={<FaBed />}
                  type={"number"}
                  rightAddon={
                    formData.bedrooms > 1 ? t("units.rooms") : t("units.room")
                  }
                />
                <CustomInput
                  isRequired
                  w={"auto"}
                  name={"bathrooms"}
                  label={t("form.bathrooms")}
                  value={formData.bathrooms}
                  onChange={onChange}
                  icon={<FaBath />}
                  type={"number"}
                  rightAddon={
                    formData.bathrooms > 1 ? t("units.rooms") : t("units.room")
                  }
                />
              </HStack>
              <HStack>
                <CustomInput
                  isRequired
                  w={"auto"}
                  name={"width"}
                  label={t("form.width")}
                  value={formData.width}
                  onChange={onChange}
                  type={"number"}
                  rightAddon={t("units.ft")}
                  isInvalid={error.width}
                />
                <CustomInput
                  isRequired
                  w={"auto"}
                  name={"length"}
                  label={t("form.length")}
                  value={formData.length}
                  onChange={onChange}
                  type={"number"}
                  rightAddon={t("units.ft")}
                  isInvalid={error.length}
                />

                <CustomInput
                  w={"auto"}
                  label={t("form.home")}
                  value={formData.length * formData.width}
                  rightAddon={t("units.sqft")}
                  readOnly
                />
              </HStack>
              {(formData.category === "house" ||
                formData.category === "lot") && (
                <HStack>
                  <CustomInput
                    isRequired
                    w={"auto"}
                    name={"lot_width"}
                    label={t("form.lot_width")}
                    value={formData.lot_width}
                    onChange={onChange}
                    type={"number"}
                    rightAddon={t("units.ft")}
                    isInvalid={error.lot_width}
                  />
                  <CustomInput
                    isRequired
                    w={"auto"}
                    name={"lot_length"}
                    label={t("form.lot_length")}
                    value={formData.lot_length}
                    onChange={onChange}
                    type={"number"}
                    rightAddon={t("units.ft")}
                    isInvalid={error.lot_length}
                  />
                  <CustomInput
                    w={"auto"}
                    label={t("form.lot")}
                    value={formData.lot_length * formData.lot_width}
                    rightAddon={t("units.sqft")}
                    readOnly
                  />
                </HStack>
              )}
              <HStack>
                <CustomInput
                  name={"home_no"}
                  label={
                    formData.category === "apartment" ||
                    formData.category === "condo"
                      ? t("form.building_no")
                      : t("form.home_no")
                  }
                  value={formData.home_no}
                  onChange={onChange}
                />
                <CustomInput
                  name={"street"}
                  label={t("form.street")}
                  value={formData.street}
                  onChange={onChange}
                />
              </HStack>
              <HStack>
                <FormControl isRequired isInvalid={error.township}>
                  <FormLabel>{t("form.township")}</FormLabel>
                  <Select
                    name={"township"}
                    value={formData.township}
                    onChange={onChange}
                  >
                    {Object.keys(jsonFile[formData.state]).map(
                      (township, idx) => (
                        <option value={township} key={`${township}-${idx}`}>
                          {t(`${formData.state}.${township}`)}
                        </option>
                      )
                    )}
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>{t("form.state")}</FormLabel>
                  <Select
                    name={"state"}
                    value={formData.state}
                    onChange={onChange}
                  >
                    {Object.keys(jsonFile.states).map((state, idx) => (
                      <option value={state} key={`${state}-${idx}`}>
                        {t(`states.${state}`)}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </HStack>

              <HStack alignItems={"end"} wrap={"wrap"}>
                <CustomInput
                  name={"lat"}
                  label={t("form.lat")}
                  value={formData.lat}
                  onChange={onChange}
                  type={"number"}
                  w={"auto"}
                  min={-180}
                  max={180}
                />
                <CustomInput
                  name={"lng"}
                  label={t("form.lng")}
                  value={formData.lng}
                  onChange={onChange}
                  type={"number"}
                  w={"auto"}
                  min={-180}
                  max={180}
                />
                <GradientButton
                  buttonText={t("form.auto-fill")}
                  onClick={getCurrentLocation}
                />
                <GradientButton
                  buttonText={t("form.google-map")}
                  href={
                    formData.lat && formData.lng
                      ? `https://www.google.com/maps/place/${formData.lat},${formData.lng}`
                      : "https://www.google.com/maps"
                  }
                  isExternal
                />
              </HStack>
              <FormControl isRequired>
                <FormLabel>{t("form.phone_number")}</FormLabel>
                <VStack spacing={3} alignItems={"start"}>
                  {phones.map((phone, idx) => (
                    <HStack key={`phone-${idx}`}>
                      <CustomInput
                        value={phone}
                        isInvalid={error.phone_numbers}
                        onChange={(e) => {
                          setPhones(
                            phones.map((ph, i) =>
                              i === idx ? e.target.value : ph
                            )
                          );
                        }}
                        icon={<FaPhoneAlt />}
                        type={"number"}
                        isRequired={idx === 0}
                      />
                      {idx === 0 ? (
                        <Button
                          variant={"outline"}
                          onClick={() => setPhones((prev) => prev.concat(""))}
                        >
                          +
                        </Button>
                      ) : (
                        <Button
                          variant={"outline"}
                          onClick={() =>
                            setPhones((prev) =>
                              prev.filter((v, i) => i !== idx)
                            )
                          }
                        >
                          -
                        </Button>
                      )}
                    </HStack>
                  ))}
                </VStack>
              </FormControl>

              {photos && (
                <Flex direction={"row"} wrap={"wrap"}>
                  {photos.map((photo, idx) => (
                    <ImagePopover
                      src={photo}
                      idx={idx}
                      onClick={() => removePhoto(idx)}
                      key={`photo-${idx}`}
                    />
                  ))}
                </Flex>
              )}
              <FormControl>
                <FormLabel>Add photos</FormLabel>
                <GradientButton
                  onClick={(e) => {
                    fileInput.current.click();
                  }}
                  buttonText={<MdAddAPhoto />}
                  mb={3}
                />

                <Dropzone
                  onDrop={onDrop}
                  accept={"image/jpg,image/png,image/jpeg,image/svg"}
                >
                  {({ getRootProps, getInputProps, isDragActive }) => (
                    <Box
                      border={"dotted"}
                      p={10}
                      bg={isDragActive ? "green.100" : ""}
                      color={isDragActive ? "green.400" : ""}
                      {...getRootProps()}
                    >
                      <Input
                        type={"file"}
                        accept={"image/jpg,image/png,image/jpeg,image/svg"}
                        {...getInputProps}
                        multiple
                        onChange={onChangeInputFiles}
                        ref={fileInput}
                        hidden
                      />
                      <Text
                        fontSize={isDragActive ? "xl" : "xs"}
                        fontWeight={isDragActive ? "semibold" : ""}
                        align={"center"}
                      >
                        {isDragActive
                          ? "Yes, drop the photos here!"
                          : "Or drop your photos here"}
                      </Text>
                    </Box>
                  )}
                </Dropzone>
              </FormControl>
            </Stack>
            <GradientButton
              buttonText={"Submit"}
              onClick={onSubmit}
              w={"full"}
              mt={10}
              isLoading={isLoading}
            />
          </Box>
        </Stack>
      </Box>
    </Layout>
  );
};

const ImagePopover = ({ src, idx, onClick }) => {
  const { onClose } = useDisclosure();
  // const popover = useRef();
  return (
    <Popover>
      <PopoverTrigger>
        <Image alt={`photo-${idx}`} src={src} m={3} height={72} />
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>Want to remove this photo?</PopoverHeader>
        <PopoverBody align={"right"}>
          <Button colorScheme={"green"} mx={3} onClick={onClick}>
            Yes
          </Button>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
export default CreateNewListing;
