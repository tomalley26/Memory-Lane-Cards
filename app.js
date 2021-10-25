
firebase.auth().signInAnonymously()

window.state = function state() {

  const api = {

    cartData: {},

    isCartOpen: false,

    currentItem: createEmptyItem(),

    async purchase() {

      const { data } = await firebase.functions().httpsCallable('getSessionId')({
        items: this.cartData.items
      })

      const stripe = new Stripe(data.stripePublishableKey)

      stripe.redirectToCheckout({ sessionId: data.sessionId })
    },

    openCart() {
      console.log(api.cartData)
      this.isCartOpen = true
    },

    closeCart() {
      this.isCartOpen = false
    },

    stop(e) { e.stopPropagation() },

    addToCart() {
      this.cartData.items.includes(this.currentItem) || this.cartData.items.push(this.currentItem)
      writeCartData()
      this.openCart()
    },

    updateCart() {
      writeCartData()
    },

    deleteFromCart(index) {
      this.cartData.items.splice(index, 1)
      writeCartData()
    },

    createAnother() {
      this.currentItem = createEmptyItem()
      this.selectPrompts()
      this.closeCart()
    },

    editItem(item) {
      this.currentItem = item
      this.closeCart()
    },

    selectPrompts() {
      let prompts = rand(PROMPTS[this.currentItem.prompt])
      if (this.currentItem.prompt === 'mixed') {
        prompts = [
          rand(PROMPTS.mixed[0]),
          rand(PROMPTS.mixed[1]),
          rand(PROMPTS.mixed[2]),
        ]
      } else {
        prompts = rand(PROMPTS[this.currentItem.prompt])
      }
      this.currentItem.prompts = prompts
    },

    clearPhoto() {
      this.currentItem.photo = null
    },

    handlePhoto(e) {
      const [ file ] = e.target.files
      const fr = new FileReader
      fr.onload = e => {
        const img = document.createElement("img");
        img.onload = () => {

          var MAX_WIDTH = 800;
          var MAX_HEIGHT = 800;

          var width = img.width;
          var height = img.height;

          // Change the resizing logic
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = height * (MAX_WIDTH / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = width * (MAX_HEIGHT / height);
              height = MAX_HEIGHT;
            }
          }

          var canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          var ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          var dataurl = canvas.toDataURL(file.type);
          this.currentItem.photo = dataurl
        }
        img.src = e.target.result;
      }
      fr.readAsDataURL(file)
    }
  }

  function createEmptyItem() {

    const type = window.location.hash.slice(1)
    if (!type) return window.location.href = '/'

    return {
      quantity: 1,
      style: type,
      name: '',
      phone: '',
      prompt: 'short',
      note: '',
      photo: null,
      includePhoto: false
    }
  }

  function readCartData() {
    api.cartData = JSON.parse(localStorage.getItem('cart') || '{ "items": [] }')
  }

  function writeCartData() {
    localStorage.setItem('cart', JSON.stringify(api.cartData))
  }

  readCartData()

  if (api.cartData.items.length) {
    api.openCart()
  }

  return api
}

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

const PROMPTS = {
  short: [
    [
      'Do remember when home was filled with the delicious smell of _ cooking in the kitchen?',
      'I was never disappointed because it always tasted _',
      'These memories of the smell and taste of great food make me feel _'
    ],
    [
      'Do you remember how we used to _ to get to school every day?',
      'The subject I liked the best was _',
      'The thing I enjoyed most about school was _'
    ],
    [
      'Do you remember the song _ that everybody used to sing?',
      'Do you remember the dance _ that everybody used to do?',
      'Do you remember the game _ that everybody used to play?'
    ]
  ],
  medium: [
    [
      'Do you remember when we were teenagers how we used to __',
      'Back then we thought __',
      'I miss those days because __',
    ],
    [
      'Do you remember when we used to play __',
      'It was a lot of fun because __',
      'The most enjoyable part was __',
    ],
    [
      'Do you remember how we used to eat __',
      'Remembering that food makes me think of __',
      'That memory is special to me because __',
    ]
  ],
  long: [
    [
      'Do you remember when ___',
      'That was special to me because ___',
      'I will always treasure ___',
    ],
    [
      'Do you remember the song ___',
      'That song was special to me because ___',
      'I will always treasure ___',
    ],
    [
      'Do you remember the delicious ___',
      'That was special to me because ___',
      'I will always treasure ___',
    ]
  ],
  mixed: [
    [
      'Do you remember the song _ that everybody used to sing?',
      'Do you remember the dance _ that everybody used to do?',
      'Do you remember the game _ that everybody used to play?',
    ],
    [
      'Do you remember when we were teenagers how we used to __',
      'Back then we thought __',
      'I miss those days because __',
    ],
    [
      'Do you remember when ___',
      'That was special to me because ___',
      'I will always treasure ___',
    ]
  ]
}
