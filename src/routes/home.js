// import { useMoralis } from "react-moralis";
import {
  Center,
  Button,
  Input,
  Text,
  Link,
  Image,
  HStack,
  InputGroup,
  Heading,
  Flex,
  FormControl,
  FormLabel,
  FormHelperText,
  InputRightElement,
  Stack,
  Box,
  Textarea,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { useToast } from "@chakra-ui/react";

import globals from "../globals";
import Arweave from "arweave";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faHandshake,
  faWallet,
  faArrowUp,
  faTimes,
  faCopy,
} from "@fortawesome/free-solid-svg-icons";

const arweave = Arweave.init({});

function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [privateKey, setPrivateKey] = useState("");
  const [userBalance, setUserBalance] = useState("");
  const [ptValue, setPtValue] = useState("");
  const [uploadedLinks, setUploadedLinks] = useState([]);
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [address, setAddress] = useState("Not set");
  const [isUploading, setIsUploading] = useState(false);
  const [isFileUploading, setIsFileUploading] = useState(false);
  const [fileUploadProgress, setFileUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [inputPrivateKey, setInputPrivateKey] = useState("");

  const toast = useToast();
  const host = "arweave.net:443";

  useEffect(() => {
    if (inputPrivateKey === "") setButtonDisabled(true);
    else setButtonDisabled(false);
  }, [inputPrivateKey]);

  function showToastSuccess() {
    toast({
      title: "ARWeave Tools ",
      description: `Transaction was sent succesfully!`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  }

  function showToastError(e) {
    toast({
      title: "Transaction confirmation failed ",
      description: e,
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  }

  function showToastCreated() {
    toast({
      title: "ARWeave Tools ",
      description: `Transaction was created. Sending via ${host}...`,
      status: "info",
      duration: 1300,
      isClosable: true,
    });
  }

  async function handleSendPlaintext() {
    setIsUploading(true);
    const key = globals.arweave.key;
    let tx = await arweave.createTransaction(
      {
        data: ptValue,
      },
      key
    );

    try {
      await arweave.transactions.sign(tx, key);
      let uploader = await arweave.transactions.getUploader(tx);
      showToastCreated();
      console.log("TX Created: " + tx);
      while (!uploader.isComplete) {
        await uploader.uploadChunk();
        console.log(
          `${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`
        );
      }

      const response = await arweave.transactions.post(tx);
      if (response.status === 200) {
        showToastSuccess();
        setUploadedLinks((arr) => [{ id: tx.id, name: "Plaintext" }, ...arr]);
        setIsUploading(false);
      }
    } catch (e) {
      setIsUploading(false);
      showToastError(e);
    }
  }

  async function handleSendFile() {
    const key = globals.arweave.key;

    showToastCreated();
    setIsFileUploading(true);

    try {
      for (var i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = async () => {
          let data = reader.result;
          let tx = await arweave.createTransaction({ data: data }, key);
          tx.addTag("Content-Type", file.type);

          await arweave.transactions.sign(tx, key);

          let uploader = await arweave.transactions.getUploader(tx);

          while (!uploader.isComplete) {
            setFileUploadProgress(uploader.pctComplete + "%");
            await uploader.uploadChunk();
            console.log(
              `${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`
            );
          }

          const response = await arweave.transactions.post(tx);
          if (response.status === 200) {
            showToastSuccess();
            setUploadedLinks((arr) => [{ id: tx.id, name: file.name }, ...arr]);
            setIsFileUploading(false);
          }
        };
      }
    } catch (e) {
      setIsFileUploading(false);
      showToastError(e);
    }
  }

  function getBalance() {
    arweave.wallets.getBalance(globals.arweave.pkey).then((balance) => {
      let ar = arweave.ar.winstonToAr(balance);
      setUserBalance(ar);
    });
  }

  function setSession(key) {
    setPrivateKey(key.p);
    setIsAuthenticated(true);
    getBalance();
  }

  function generateWallet() {
    arweave.wallets.generate().then(async (key) => {
      console.log(key);
      globals.arweave.key = key;
      globals.arweave.pkey = key.p;
      globals.arweave.address = await arweave.wallets.jwkToAddress(key);
      setSession(key);
    });
  }

  async function loginWithPrivateKey() {
    const clipboard = await navigator.clipboard.readText();
    const key = JSON.parse(clipboard);
    globals.arweave.key = key;
    globals.arweave.pkey = key.p;
    globals.arweave.address = await arweave.wallets.jwkToAddress(key);
    setSession(key);
  }

  function getWalletFromPrivateKey() {
    arweave.wallets.jwkToAddress(globals.arweave.key).then((address) => {
      return address;
    });
  }

  const UnauthenticatedLoginPrompt = () => {
    return (
      <Center minH="3xl">
        <Box mt="10">
          <Heading mb={5} textAlign={"center"}>
            ARWeave Client
            <Text fontSize={14} textColor="gray.500">
              v0.0.1
            </Text>
          </Heading>
          <Stack spacing={3}>
            {/* <Textarea
              onChange={(e) => {
                setInputPrivateKey(e.target.value);
              }}
              value={inputPrivateKey}
              placeholder="Private key"
            /> */}
            <Button
              bg="gray.600"
              color="white"
              leftIcon={<FontAwesomeIcon icon={faHandshake} />}
              onClick={() => {
                loginWithPrivateKey();
              }}
            >
              Login to ARWeave network using private key from clipboard
            </Button>
            <Button
              leftIcon={<FontAwesomeIcon icon={faWallet} />}
              bg="red"
              color="white"
              onClick={() => generateWallet()}
            >
              Generate wallet and login to ARWeave Panel
            </Button>
            <Box maxW="500" textAlign={"justify"} textColor="gray.400">
              ARWeave Client does not save your private keys. For the moment,
              uploading a new file with 0 AR balance is possible, so we
              encourage you to first test this tool out by using a randomly
              generated account. You can check the Network tab to convince
              yourself the only network activity is between you and the ARWeave
              node. This tool's source code is publicly available at:
              <Link
                ml={1}
                color={"blue.400"}
                href="https://github.com/vscorpio/arweavetool"
                isExternal
              >
                GitHub
                <ExternalLinkIcon mx="2px" />
              </Link>
            </Box>
          </Stack>
        </Box>
      </Center>
    );
  };

  useEffect(() => {
    if (address !== "") setAddress(getWalletFromPrivateKey());
  }, [address]);

  if (!isAuthenticated) {
    return <UnauthenticatedLoginPrompt />;
  }

  const FileBox = ({ isLoading, isImage, fileId, fileName }) => {
    function deleteFileFromHistory(fileId) {
      setUploadedLinks(uploadedLinks.filter((item) => item.id !== fileId));
    }
    return (
      <Box my={5} bg="gray.700" borderRadius={20} p={5}>
        <Text>
          {" "}
          Status: {<FontAwesomeIcon color="yellowgreen" icon={faCheck} />}{" "}
          Confirmed
        </Text>
        <Text>File: {fileName}</Text>
        <Text>
          File ID:{" "}
          <Link href={"https://arweave.net:443/" + fileId} isExternal>
            {fileId} <ExternalLinkIcon mx="2px" />
          </Link>
        </Text>
        {isImage && (
          <Box>
            <Text>Image mini-preview:</Text>
            <Image
              maxW="200"
              maxH="200"
              src={"https://via.placeholder.com/200"}
            ></Image>
          </Box>
        )}
        <HStack>
          <Button
            leftIcon={<FontAwesomeIcon icon={faCopy} />}
            bg={"blue.500"}
            color={"white"}
          >
            Copy link to clipboard
          </Button>
          <Button
            leftIcon={<FontAwesomeIcon icon={faTimes} />}
            bg={"red.500"}
            color={"white"}
            onClick={() => deleteFileFromHistory(fileId)}
          >
            Remove this item from history
          </Button>
        </HStack>
      </Box>
    );
  };

  return (
    <Center>
      <Box minW="700" mt="10">
        <Heading mb={5} textAlign={"center"}>
          ARWeave Client
          <Text fontSize={14} textColor="gray.500">
            v0.0.1
          </Text>
          <Button
            bg="green"
            color="white"
            leftIcon={<FontAwesomeIcon icon={faCheck} />}
          >
            Connected to AR Network via{" "}
            <Box
              textTransform={"lowercase"}
              variant="solid"
              ml={1.5}
              color="gray.900"
            >
              arweave.net:443
            </Box>
          </Button>
        </Heading>
        <Stack spacing={3}>
          <FormControl>
            <FormLabel htmlFor="email">Wallet balance</FormLabel>
            <Input disabled value={userBalance + " AR"} type="text" />
            <FormHelperText>
              Out of AR? Get sum'{" "}
              <Link textColor="blue.500" href="https://google.com">
                here
              </Link>
              .
            </FormHelperText>
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="email">Wallet address</FormLabel>
            <Input disabled value={globals.arweave.address} type="text" />
          </FormControl>
          <FormLabel>Plain-text upload</FormLabel>
        </Stack>
        <Stack mt={2} spacing={3}>
          <Flex>
            <Input
              onChange={(event) => setPtValue(event.target.value)}
              placeholder="Lorem ipsum dolor sit amet"
            />
            <Button
              value={ptValue}
              ml={3}
              leftIcon={<FontAwesomeIcon icon={faArrowUp} />}
              colorScheme={"green"}
              isLoading={isUploading}
              onClick={() => handleSendPlaintext()}
            >
              Upload
            </Button>
          </Flex>
          <Flex>
            <Input
              onChange={(e) => {
                setSelectedFiles(e.target.files);
                setIsFileUploading(false);
              }}
              p={1}
              type="file"
              placeholder="Lorem ipsum dolor sit amet"
            />
            <Button
              value={selectedFiles}
              ml={3}
              leftIcon={<FontAwesomeIcon icon={faArrowUp} />}
              colorScheme={"green"}
              isLoading={isFileUploading}
              loadingText={fileUploadProgress}
              onClick={() => handleSendFile()}
            >
              Upload
            </Button>
          </Flex>
        </Stack>

        <Stack spacing={3}>
          {uploadedLinks.map((link) => {
            return (
              link && (
                <FileBox
                  key={link.id ? link.id : 0}
                  fileId={link.id ? link.id : 0}
                  fileName={link.name}
                />
              )
            );
          })}
        </Stack>
      </Box>
    </Center>
  );
}

export default Home;
