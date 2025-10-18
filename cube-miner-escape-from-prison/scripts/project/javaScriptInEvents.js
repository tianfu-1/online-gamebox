

const scriptsInEvents = {

	async _menu_Event6_Act2(runtime, localVars)
	{

	},

	async _menu_Event7_Act1(runtime, localVars)
	{

	},

	async _menu_Event223_Act2(runtime, localVars)
	{

	},

	async _loader_Event6_Act2(runtime, localVars)
	{

	},

	async _loader_Event9(runtime, localVars)
	{

	},

	async _loader_Event10_Act3(runtime, localVars)
	{

	},

	async _loader_Event16(runtime, localVars)
	{
		document.body.style.setProperty('-webkit-touch-callout', 'none');
		document.body.style.setProperty('-webkit-user-select', 'none');
		document.body.style.setProperty('-khtml-user-select', 'none');
		document.body.style.setProperty('-moz-user-select', 'none');
		document.body.style.setProperty('-ms-user-select', 'none');
		document.body.style.setProperty('user-select', 'none');
		
	},

	async _loader_Event17_Act3(runtime, localVars)
	{

	},

	async _loader_Event17_Act5(runtime, localVars)
	{

	},

	async _loader_Event18_Act1(runtime, localVars)
	{

	},

	async _menumain_Event4_Act1(runtime, localVars)
	{

	},

	async _menumain_Event5_Act1(runtime, localVars)
	{

	},

	async _menumain_Event36_Act1(runtime, localVars)
	{

	},

	async _include_Event66_Act3(runtime, localVars)
	{

	},

	async _include_Event238_Act6(runtime, localVars)
	{
		console.log("start");
	},

	async _include_Event240_Act6(runtime, localVars)
	{
		console.log("start");
	},

	async _include_Event241_Act7(runtime, localVars)
	{

	},

	async _include_Event256_Act3(runtime, localVars)
	{

	},

	async _include_Event260_Act3(runtime, localVars)
	{

	},

	async _include_Event526_Act13(runtime, localVars)
	{

	},

	async _include_Event526_Act14(runtime, localVars)
	{

	},

	async _include_Event526_Act15(runtime, localVars)
	{

	},

	async _include_Event548_Act1(runtime, localVars)
	{

	},

	async _include_Event635_Act1(runtime, localVars)
	{

	},

	async _include_Event635_Act2(runtime, localVars)
	{

	},

	async _include_Event635_Act3(runtime, localVars)
	{

	},

	async _include_Event635_Act4(runtime, localVars)
	{

	},

	async _include_Event697_Act1(runtime, localVars)
	{

	},

	async _include_Event698_Act1(runtime, localVars)
	{

	},

	async _include_Event699_Act1(runtime, localVars)
	{

	},

	async _include_Event700_Act1(runtime, localVars)
	{

	},

	async _include_Event722_Act1(runtime, localVars)
	{

	},

	async _include_Event723_Act1(runtime, localVars)
	{

	},

	async _include_Event732_Act1(runtime, localVars)
	{

	},

	async _include_Event760_Act2(runtime, localVars)
	{

	},

	async _include_Event761_Act1(runtime, localVars)
	{

	},

	async _include_Event794_Act1(runtime, localVars)
	{

	},

	async _include_Event795_Act1(runtime, localVars)
	{

	},

	async _include_Event801_Act1(runtime, localVars)
	{

	},

	async _include_Event802_Act1(runtime, localVars)
	{

	},

	async _game_Event1835_Act1(runtime, localVars)
	{

	},

	async _game_Event1836_Act1(runtime, localVars)
	{

	},

	async _game_Event1839_Act1(runtime, localVars)
	{

	},

	async _game_Event1840_Act1(runtime, localVars)
	{

	},

	async _game_Event1844_Act1(runtime, localVars)
	{

	},

	async _game_Event1845_Act1(runtime, localVars)
	{

	},

	async _game_Event1849_Act1(runtime, localVars)
	{

	},

	async _game_Event1850_Act1(runtime, localVars)
	{

	},

	async _game_Event1951_Act1(runtime, localVars)
	{

	},

	async _game_Event1952_Act1(runtime, localVars)
	{
		runtime.callFunction("getCar");
	},

	async _game_Event2158_Act1(runtime, localVars)
	{
		payments.purchase({ id: '5000coin' }).then(purchase => {
		          runtime.globalVars.rewardNow = "5000coin";
		          runtime.globalVars.yndxState = "getRewarded";
		    }).catch(err => {
		        // Покупка не удалась: в консоли разработчика не добавлен товар с таким id,
		        // пользователь не авторизовался, передумал и закрыл окно оплаты,
		        // истекло отведенное на покупку время, не хватило денег и т. д.
		    })
		
		
	},

	async _game_Event2423_Act1(runtime, localVars)
	{

	},

	async _game_Event3345_Act1(runtime, localVars)
	{

	},

	async _game_Event3346_Act1(runtime, localVars)
	{

	},

	async _game_Event3347_Act1(runtime, localVars)
	{

	},

	async _game_Event3348_Act1(runtime, localVars)
	{

	},

	async _game_Event3597_Act1(runtime, localVars)
	{
		let randomNumber;
		
		do {
		    randomNumber = Math.floor(Math.random() * 10) + 1;
		} while (randomNumber === localVars.R);
		
		localVars.R = randomNumber;
		
		console.log("Сгенерировано новое случайное число:", randomNumber);
		
	},

	async _game_Event3598_Act1(runtime, localVars)
	{
		let randomNumber;
		
		do {
		    randomNumber = Math.floor(Math.random() * 14) + 1;
		} while (randomNumber === localVars.R);
		
		localVars.R = randomNumber;
		
		console.log("Сгенерировано новое случайное число:", randomNumber);
		
	},

	async _game_Event3745_Act1(runtime, localVars)
	{
		// random
		function getRandomNumber(min, max) {
		  return Math.floor(Math.random() * (max - min + 1)) + min;
		}
		// get 2 random numbers from array
		function getTwoUniqueRandomNumbers(numbers) {
		  // mixer to 2 number
		  numbers = numbers.sort(() => Math.random() - 0.5);
		  // selet two first nubmers
		  return [numbers[0], numbers[1]];
		}
		// numbers
		var numbers = [1, 2, 3];
		// get two random numbers shnumbers
		var randomNumbers = getTwoUniqueRandomNumbers(numbers);
		//op paaa
		localVars.mixer=randomNumbers;
	},

	async _game_Event4035_Act4(runtime, localVars)
	{

	},

	async _game_Event4035_Act5(runtime, localVars)
	{

	},

	async _game_Event4069_Act1(runtime, localVars)
	{

	},

	async _game_Event4158_Act1(runtime, localVars)
	{

	},

	async _include_Event804_Act1(runtime, localVars)
	{
		// Определим переменную — по умолчанию false (ПК)
		runtime.globalVars.mobilePlatform = false;
		
		// Проверка устройства
		function isMobileDevice() {
		    return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|BlackBerry/i.test(navigator.userAgent) ||
		           (navigator.maxTouchPoints && navigator.maxTouchPoints > 1); // поддержка сенсора
		}
		
		// Установим значение переменной в зависимости от платформы
		if (isMobileDevice()) {
		    runtime.globalVars.mobilePlatform = true;
		    console.log("platform: Mobile");
		} else {
		    console.log("platform: PC");
		}
		
	}
};

globalThis.C3.JavaScriptInEvents = scriptsInEvents;
