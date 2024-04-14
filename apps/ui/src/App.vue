<script setup lang="ts">
import { startIntercom } from './helpers/intercom';
import Post from './components/Post/post.vue';
import ISocialMedia from './artifacts/ISocialMedia.json'
import { contract_add } from "./artifacts/config";
import { ethers } from "ethers";
import Web3 from "web3";
import Web3Modal from "web3modal";
const el = ref(null);
const route = useRoute();
const router = useRouter();
const uiStore = useUiStore();
const { modalOpen } = useModal();
const { init, app } = useApp();
const { web3 } = useWeb3();
const { isSwiping, direction } = useSwipe(el);
const { createDraft } = useEditor();
const { spaceKey, network, executionStrategy, transaction, reset } = useWalletConnectTransaction();
provide('web3', web3);
const scrollDisabled = computed(() => modalOpen.value || uiStore.sidebarOpen);

onMounted(async () => {
  await fetchPostsFromBlockchain();
});

// Define the interface for a post
interface Post {
  id: number;
  author: string;
  content: string;
  likes: number;
  rewardPoints: number; // Assuming rewardPoints is a number, adjust the type as necessary
  liked: boolean; // Assuming you're using a 'liked' property, adjust the type as necessary
}

// Use the interface to type the 'posts' ref
const posts = ref<Post[]>([]);
const newPostContent = ref('');


async function fetchPostsFromBlockchain() {
  try {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();

    // Using ethers.js for smart contract interaction
    const provider = new ethers.providers.Web3Provider(connection);
    const resp = new ethers.Contract(contract_add, ISocialMedia.abi, provider);

    // Call getAllPosts function
    const tx = await resp.getAllPosts();
    const tx2 = await resp.getRewardPoints();

    // Log the response to see if it's returning the expected data
    console.log("All Posts:", tx);
    console.log("Reward Points:", parseInt(tx2), tx2);

    // Display posts
    const formattedPosts = tx.map(post => ({
      id: parseInt(post[0]),
      author: post[1],
      content: post[2],
      timestamp: parseInt(post[3]),
      likes: parseInt(post[4]),
      // Assuming rewardPoints is a property you want to include, adjust accordingly
      rewardPoints: parseInt(tx2), // Example adjustment
    }));

    console.log("Formatted Posts:", formattedPosts);

    // Update the posts ref with the fetched data
    posts.value = formattedPosts;
  } catch (error) {
    console.error('Error fetching posts from blockchain:', error);
  }
}



const createPost = async () => {
  if (newPostContent.value.trim() !== '') {
    const newPost = {
      content: newPostContent.value,

    };
    // posts.value.push(newPost);
    newPostContent.value = '';

    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();

      const resp = new ethers.Contract(contract_add, ISocialMedia.abi, signer);
      const tx = await resp.createPost(newPost.content);
      await tx.wait();
      console.log("Post created on the blockchain!", resp);
      fetchPostsFromBlockchain()
    } catch (error) {
      console.error("Error creating post on the blockchain:", error);
    }
  }
};

async function toggleLike(post) {
  // post.liked = !post.liked;
  console.log(post.liked)
  const web3Modal = new Web3Modal();

  const connection = await web3Modal.connect();
  const provider = new ethers.providers.Web3Provider(connection);
  const signer = provider.getSigner();

  const resp = new ethers.Contract(contract_add, ISocialMedia.abi, signer);
  const tx = await resp.likePost(post.id);
  await tx.wait();
  console.log("Post created on the blockchain!", resp);
  fetchPostsFromBlockchain()
  post.likes += post.liked ? 1 : -1;
}

async function toggleUnlike(post) {
  // post.liked = !post.liked;
  console.log(post.liked)
  const web3Modal = new Web3Modal();

  const connection = await web3Modal.connect();
  const provider = new ethers.providers.Web3Provider(connection);
  const signer = provider.getSigner();
  const resp = new ethers.Contract(contract_add, ISocialMedia.abi, signer);
  const tx = await resp.unlikePost(post.id);
  await tx.wait();
  console.log("Post created on the blockchain!", resp);
  fetchPostsFromBlockchain()
  post.likes += post.liked ? 1 : -1;
}

onMounted(async () => {
  startIntercom();
  uiStore.restorePendingTransactions();
  await init();
});

watch(scrollDisabled, val => {
  const el = document.body;
  el.classList[val ? 'add' : 'remove']('overflow-hidden');
});

watch(route, () => {
  uiStore.sidebarOpen = false;
});

watch(isSwiping, () => {
  if (isSwiping.value && !modalOpen.value && ((direction.value === 'right' && !uiStore.sidebarOpen) || (direction.value === 'left' && uiStore.sidebarOpen))) {
    uiStore.toggleSidebar();
  }
});
</script>

<template>
  <div ref="el" class="">
    <UiLoading v-if="app.loading || !app.init" class="overlay big" />
    <div v-else class="pb-6 flex">
      <AppSidebar class="lg:visible" :class="{ invisible: !uiStore.sidebarOpen }" />
      <AppTopnav />
      <AppNav />

      <div v-if="uiStore.sidebarOpen" class="backdrop lg:hidden"
        :style="{ left: `${72 + (route.matched[0]?.name === 'space' ? 240 : 0)}px` }" @click="uiStore.toggleSidebar" />

    </div>
    <div class="formData flex flex-col justify-center px-20 w-full my-10">
      <div class="flex items-center justify-center gap-5 create-post">
        <div>
          <textarea class="border-[1px] rounded-xl px-4 w-80 py-2" v-model="newPostContent"
            placeholder="What's on your mind?"> </textarea>

        </div>
        <button class="ml-10 bg-black rounded-full px-4 py-2 text-white" @click="createPost">Post</button>
      </div>
      <div class="posts">
        <Post v-for="post in posts" :key="post.id" :author="post.author" :content="post.content" :likes="post.likes"
          :rewardPoints="post.rewardPoints" :liked="post.liked" @toggle-like="toggleLike(post)"
          @toggle-unlike="toggleUnlike(post)" />
      </div>
    </div>
  </div>
</template>

<style>
.formData {
  position: flex-col;
  justify-items: center;
  padding: 100px;
  top: 20;
  bottom: 0;
  left: 0;
  right: 0;
}
</style>