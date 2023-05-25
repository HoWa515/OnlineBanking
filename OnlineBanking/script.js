'use strict';


// data

const account1 = {
  owner: 'Kevin K',
  movements: [200, 455, -306.5, 25000, -642.21, -133, 79.97, 1300],
  interestRate: 1.0, // in percent
  pin: 1111,
  currency: 'EUR',
};

const account2 = {
  owner: 'Ben B',
  movements: [5000, 3400, -150, -790, -3210, -1000, 850, -30],
  interestRate: 1.5,
  pin: 2222,
  currency: 'USD',
};

const accounts = [account1, account2];

//------------------------------------------------------------------------------
// selected Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

//--------------------------functions----------------------------------

const displayMovements = function (movements,sort = false) {
    containerMovements.innerHTML = '';//clean up the old content

    // sort mutate original array, clice() create a copy
    const movs = sort ? movements.slice().sort((a,b)=>a-b) : movements;

    movs.forEach(function(mov,i)
    {
      const type = mov > 0?'deposit':'withdrawal';
      const html = `<div class="movements__row">
        <div class="movements__type movements__type--${type}">${i+1}${type}</div>
        <div class="movements__date">3 days ago</div>
        <div class="movements__value">${mov}</div>
        </div>`;

        containerMovements.insertAdjacentHTML('afterbegin',html)
    })
}

//------------------- create a username for each account owner;
//----------------------- use first leter in lowercase as abbreviation
const createUsernames = function(accs){
    accs.forEach(function(acc){
    acc.username = acc.owner.
    toLowerCase().split(' ').map(name =>name[0]).join('');
  });
};
createUsernames(accounts);


// --------------------calculate the balance , put to webpage
const calcDisplayBalance = function(acc){
  acc.balance = acc.movements.reduce(function(acc,cur,i,arr){return acc + cur;},0)
  
  labelBalance.textContent = `${acc.balance} EUR`
}
    
//----------------------Summary: account, interest
const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes}€`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(out)}€`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest}€`;
};


//-------------------------------------updateUI
const updateUI = function(acc){
  //display movements
  displayMovements(acc.movements);
 
  // display balance
  calcDisplayBalance(acc);
  // display summary
  calcDisplaySummary(acc);
}


//---------------------------------login event handler
let currentAccount;
btnLogin.addEventListener('click',function(e){
  // prevent form submitting
  e.preventDefault();
  // username is the created property key
  currentAccount = accounts.find(
    acc =>acc.username === inputLoginUsername.value);

  if(currentAccount?.pin === Number(inputLoginPin.value)){
    //display UI and welcome message
    labelWelcome.textContent = `Welcome back,${currentAccount.owner.split(' ')[0]}`;
    containerApp.style.opacity = 100; 
    // clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    

    updateUI(currentAccount);
  }
});

//---------------------------------transfer handler
btnTransfer.addEventListener('click',function(e){
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(acc => acc.username ===inputTransferTo.value);
  
  inputTransferAmount.value = inputTransferTo.value = ' ';

  if(amount > 0 && receiverAcc &&
    currentAccount.balance >=amount 
    && receiverAcc?.username !== 
    currentAccount.username){
       currentAccount.movements.push(-amount);
       receiverAcc.movements.push(amount);
    //update UI
       updateUI(currentAccount);  
    }
});


//--------------close account handler
btnClose.addEventListener('click',function(e){
  e.preventDefault();

  if(inputCloseUsername.value === currentAccount.username
    && Number(inputClosePin.value)===currentAccount.pin){
      //calculate the index of user in array accounts that to be deleted;
      const index = accounts.findIndex(acc => acc.username === currentAccount.username);
      // console.log(index);
      
      //delete user account
      accounts.splice(index,1);
      // console.log(accounts);  already deleted;
      
      //hide UI
      containerApp.style.opacity = 0;
    }

  inputCloseUsername.value = inputClosePin.value = '';

});

//------------------------------button loan handler
btnLoan.addEventListener('click',function(e){
  e.preventDefault();
  const amount = Number(inputLoanAmount.value);

  if(amount >0 && currentAccount.movements.some(mov =>mov >= amount * 0.1)){
    currentAccount.movements.push(amount);
    updateUI(currentAccount);
  }
  inputLoanAmount.value = '';
});


//--------------------button sort handler
let sorted = false; //keep the state
btnSort.addEventListener('click',function(e){
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
})

