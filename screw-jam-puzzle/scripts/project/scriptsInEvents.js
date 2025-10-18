var rewardedInterstitialAd;// Biến này dùng cho Reward Inter
var InterlAd;// Biến này dùng cho Inter
var RewardAd;// Biến này dùng cho Reward
///////////////////////////////////////////////////////////////

// xáo trộn array
export function shuffleArray(array) {
    var _a;
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        _a = [array[j], array[i]], array[i] = _a[0], array[j] = _a[1];
    }
}

async function getBase64FromUrl(url) {
    const data = await fetch(url);
    const blob = await data.blob();

    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
            const base64data = reader.result;
            resolve(base64data);
        }
    });
}

// Mời bạn bè
export function invite_friends(url, data) {

    getBase64FromUrl(url).then((base64data) => {
        FBInstant.inviteAsync({
            action: 'CUSTOM',
            cta: "Play",
            image: base64data,
            text: {
                default: 'Play with me!',
                localizations: {}
            },
            data: {myReplayData: String(data)}
        })
            .then(function (e) {
                console.log('then', e)
            })
            .catch(function (e) {

                console.log('catch', e)

            });
    })
}

// chia sẻ game
export function share(url, data = "", text = "") {

    getBase64FromUrl(url).then((base64data) => {

        FBInstant.shareAsync({
            image: base64data,
            text: text,
            data: {myReplayData: String(data)},
            shareDestination: ['NEWSFEED', 'GROUP', 'COPY_LINK', 'MESSENGER'],
            switchContext: false,
        }).then(function () {
            // continue with the game.
        });
    })
}


export function purchaseAsyncFb(id, key,key2, runtime) {
    // id là truyền vào id mua hàng
    // key là gọi hàm khi mua thành công
    // mặc định tạo 1 function là Noti là mua hàng thất bại sẽ gọi vào đó có thể thay đổi
    let id_ = id
    let ket_ = key
    let key_=key2
    FBInstant.payments.purchaseAsync({
        productID: id_,
        developerPayload: 'pegasus',
    }).then(function (purchase) {
        console.log(purchase);
        FBInstant.payments.consumePurchaseAsync(purchase.purchaseToken)
            .then(function () {
                // call thành công mua thành công
                console.log("IAP Success!");
				runtime.callFunction("close_iaploading");
                runtime.callFunction(ket_);
            })
            .catch(function (e) {
                // call  Thất bại mua thất bại
                console.log("false buy", e)
                runtime.callFunction(key_, "Unable to make a purchase. Please try again later!");
            });

    }).catch((e) => {
	
        console.log("purchaseAsync", e);
		runtime.callFunction(key_)
    });

}

/* truyền vào 4 tham số
 1: id của món hàng lấy tử fb
 2: tên function để sử lý vật phẩm   khi mua thành công
 3: nếu mua thất bại hoặc có lỗi sẽ gọi vào function
 4: runtime
 */
export function getPurchasesAsync(id, name_function_done,name_function_faild, runtime) {
    // id là truyền vào id mua hàng
    // name_function_done  là gọi hàm khi mua thành công
    // name_function_faild là gọi hàm thất bại sẽ gọi vào
    let id_ = id;
    let key_ = name_function_done;
    let faild_Function= name_function_faild
    let runtime_ = runtime
    FBInstant.payments.getPurchasesAsync().then(function (purchases) {

        //console.log("purchases có gói hàng chưa sử lý", purchases)
        if (purchases.length) {
            for (let i = 0; i < purchases.length; i++) {
                let productID = purchases[i].productID;
                let purchaseToken = purchases[i].purchaseToken;
                FBInstant.payments.consumePurchaseAsync(purchaseToken)
                    .then(function () {
                        // call thành công
                        console.log("IAP Success!");
                        runtime_.callFunction(key_);
						runtime_.callFunction("perchaseIAPFinish");
						runtime.callFunction("close_iaploading");
                    })
                    .catch(function (e) {
                        // call  Thất bại
                        console.log("false buy", e)
                        runtime_.callFunction(faild_Function, "Unable to make a purchase. Please try again later!");
                    });
            }
        } else {
            //console.log("không có sử lý")
            purchaseAsyncFb(id_, key_,faild_Function, runtime_)
        }

    }).catch(function (e) {

        console.log("getPurchasesAsync", e)

        purchaseAsyncFb(id_, key_,faild_Function, runtime_)
    });
}


const scriptsInEvents = {

	async Loading_Event182_Act2(runtime, localVars)
	{
		let dataAjax = runtime.objects.json_levelGamePlay.getFirstInstance().getJsonDataCopy();
		//console.log("dataAjax: " ,dataAjax);
		runtime.objects.JSON_class.getFirstInstance().setJsonDataCopy([dataAjax.class]);
		runtime.objects.JSON_screw.getFirstInstance().setJsonDataCopy([dataAjax.screw]);
		runtime.objects.JSON_box.getFirstInstance().setJsonDataCopy([dataAjax.box])
		
		
	},

	async Loading_Event189_Act1(runtime, localVars)
	{
const data = runtime.objects.json_levelGamePlay.getFirstInstance().getJsonDataCopy();
const arrayLayers = data.layers;
const boxLevel = data.box;
//console.log(`data level : ${runtime.globalVars.level_}` , arrayLayers)

     function removeSpecialCharacters(str) {
        return str.replace(/[^a-zA-Z0-9_]/g, '');
    }

	
	
function hexToRgba(hex) {
    // Tách phần hex thành các phần RGB và Alpha
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const a = parseInt(hex.slice(6, 8), 16) / 255; // chuyển alpha về dạng 0-1
    
    return `${r}, ${g}, ${b}, ${a.toFixed(2)}`;
}


 function convertPOS(x, y, screenWidth = 720, screenHeight = 1280) {
        const a = 52; // phạm vi trục x
        const b = 52; // phạm vi trục y

        // Tính toán tọa độ mới trên màn hình
        const newX = x * a + screenWidth/2;
        const newY = -y * b + screenHeight/2;

        return { x: newX, y: newY };
    }

    var infoLevel =[];
    //forEach tìm tất cả layer trong 1 level
    arrayLayers.forEach((element,indexLayer) => {
        //console.log("layer: ",index);
        let arrayBar= element.bars;
        // forEach tìm tất cả class trong 1 layer
        arrayBar.forEach((element) => {
		const parentPos = convertPOS(element.pos.x, element.pos.y);
		//console.log("name sprite", element.img)
		//console.log("element.angle", element.color)
		const angle = element.angle >= 180? 360-element.angle:-element.angle
		//console.log("update angle ", angle)
            let item = {
                ...element,
				img: removeSpecialCharacters(element.img),
                pos: parentPos,
				color: hexToRgba(removeSpecialCharacters(element.color)),
				colorHex: element.color,
				countScrews:element.screws.length,
				angle:angle,
                screws: element.screws.map(screw =>{
                    return{
                        ...screw,
						img:removeSpecialCharacters(screw.img),
                        pos:convertPOS(screw.pos.x,screw.pos.y)
						}
                })
            }
            infoLevel.push({
                layer: indexLayer,
                data: item
            })
        })

     })
     //console.log("infoLevel: ",infoLevel);
	 //console.log("boxLevel: ",boxLevel);

runtime.objects.json_levelGamePlay.getFirstInstance().setJsonDataCopy(infoLevel)
if(boxLevel) runtime.objects.JSON_box.getFirstInstance().setJsonDataCopy(boxLevel)
	},

	async Home_Event327_Act2(runtime, localVars)
	{
		console.log("friend_id: "+localVars.friend_id);
		FBInstant.context.createAsync(String(localVars.friend_id))
		                .then(() => {
		                    //cb(null,Constants.FB_CALLBACK_SUCCESS);
							//runtime.globalVars.playWithFriendsSuccess = true;
							//runtime.callFunction("invitePlayWithFriends_Success");
							runtime.callFunction("socialFriends_playWithFriends");
							//console.log("PlayWithFriend 1111111111");
		                });
	},

	async Home_Event434_Act2(runtime, localVars)
	{
		FBInstant.community.canJoinOfficialGroupAsync()
		  .then(function(data) {
		    //console.log(data);
		FBInstant.community.joinOfficialGroupAsync();
		  });
	},

	async Home_Event1031_Act2(runtime, localVars)
	{
		const players = JSON.parse(localVars.jsonString);
		
		function assignRank(players) {
		  // Tạo bản sao của mảng ban đầu để sắp xếp
		  let sortedPlayers = [...players];
		
		  // Sắp xếp mảng bản sao dựa trên score trước, nếu score bằng nhau thì so sánh theo spd
		  sortedPlayers.sort((a, b) => {
		    if (b.score === a.score) {
		      return b.spd - a.spd; // Nếu score bằng nhau, so sánh theo spd
		    }
		    return b.score - a.score; // Sắp xếp theo score giảm dần
		  });
		
		  // Biến để giữ thứ hạng hiện tại và theo dõi điểm số trước đó
		  let currentRank = 1;
		  let prevPlayer = sortedPlayers[0];
		
		  // Tạo rank cho từng người chơi trong danh sách đã sắp xếp
		  sortedPlayers.forEach((player, index) => {
		    if (index > 0 && (player.score !== prevPlayer.score || player.spd !== prevPlayer.spd)) {
		      currentRank = index + 1; // Cập nhật rank mới nếu điểm hoặc tốc độ khác nhau
		    }
		    player.rank = currentRank; // Gán rank hiện tại cho người chơi
		    prevPlayer = player; // Cập nhật người chơi trước để so sánh ở vòng tiếp theo
		  });
		
		  // Gán lại rank cho từng đối tượng trong mảng ban đầu dựa trên id hoặc name (nếu không có id)
		  players.forEach(player => {
		    const rankedPlayer = sortedPlayers.find(p => p.id ? p.id === player.id : p.name === player.name && p.photo === player.photo);
		    player.rank = rankedPlayer.rank;
		  });
		
		  return players;
		}
		
		// Gọi hàm và hiển thị kết quả
		localVars.return = JSON.stringify(assignRank(players));
		
		//console.log(JSON.stringify(assignRank(players)));
		
	},

	async Home_Event1216_Act1(runtime, localVars)
	{
function getFirstDayOfMonth(timestamp) {
    // Chuyển timestamp thành đối tượng Date
    const date = new Date(timestamp);

    // Đặt ngày của tháng thành 1 (ngày đầu tiên)
    date.setDate(1);

    // Mảng các ngày trong tuần (viết tắt)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Mảng các tháng trong năm (viết tắt)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Lấy các giá trị
    const day = days[date.getDay()];   // Ngày trong tuần (viết tắt)
    const month = months[date.getMonth()]; // Tháng (viết tắt)
    const dateNumber = date.getDate().toString().padStart(2, '0');  // Định dạng ngày thành 2 chữ số
    const year = date.getFullYear();    // Năm

    // Tạo chuỗi theo định dạng "day month date year"
    return `${day} ${month} ${dateNumber} ${year}`;
}

// Ví dụ sử dụng
const timestamp = localVars.timestamp; // Lấy timestamp hiện tại
//console.log(getFirstDayOfMonth(timestamp));
localVars.Variable1 = getFirstDayOfMonth(timestamp);

	},

	async Home_Event1218_Act1(runtime, localVars)
	{
function getLastDayOfMonth(timestamp) {
    // Chuyển timestamp thành đối tượng Date
    const date = new Date(timestamp);

    // Đặt ngày của tháng thành ngày cuối cùng
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    // Mảng các ngày trong tuần (viết tắt)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Mảng các tháng trong năm (viết tắt)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Lấy các giá trị từ lastDay
    const day = days[lastDay.getDay()];   // Ngày trong tuần (viết tắt)
    const month = months[lastDay.getMonth()]; // Tháng (viết tắt)
    const dateNumber = lastDay.getDate();  // Ngày cuối cùng của tháng
    const year = lastDay.getFullYear();    // Năm

    // Tạo chuỗi theo định dạng "day month date year"
    return `${day} ${month} ${dateNumber} ${year}`;
}

// Ví dụ sử dụng
const timestamp = localVars.timestamp; // Lấy timestamp hiện tại
//console.log(getLastDayOfMonth(timestamp));
localVars.Variable1 = getLastDayOfMonth(timestamp)

	},

	async Home_Event1220_Act1(runtime, localVars)
	{
		function getDaysInMonth(timestamp) {
		    // Chuyển timestamp thành đối tượng Date
		    const date = new Date(timestamp);
		
		    // Lấy năm và tháng từ timestamp
		    const year = date.getFullYear();
		    const month = date.getMonth();
		
		    // Tạo một đối tượng Date cho tháng kế tiếp và set ngày là 0 để có ngày cuối cùng của tháng hiện tại
		    const lastDayOfMonth = new Date(year, month + 1, 0);
		
		    // Trả về ngày cuối cùng (số lượng ngày trong tháng)
		    return lastDayOfMonth.getDate();
		}
		
		// Ví dụ sử dụng
		const timestamp = localVars.timestamp; // Lấy timestamp hiện tại
		//console.log(getDaysInMonth(timestamp));
		localVars.timestamp = getDaysInMonth(timestamp);
	},

	async Home_Event1590_Act1(runtime, localVars)
	{
		var days = [1, 7, 6, 5, 4, 3, 2];
		var d = new Date();
		d.setDate(d.getDate() + days[d.getDay()]);
		d.setHours(0, 0, 0, 0); // Đặt giờ, phút, giây và mili giây thành 0
		var timestamp = d.getTime();
		//console.log(timestamp);
		
		localVars.Variable1 = timestamp;
	},

	async Ev_gameplay_Event1173_Act1(runtime, localVars)
	{
		FBInstant.updateAsync({
		                action: 'CUSTOM',
		                cta: "▶️ PLAY NOW!",
		                image: localVars.base64String,
		                text: {
		                    default: 'Play the Screw Jam Puzzle game with me!',
		                    localizations: {
		                        ar_AR: 'العب لعبة Screw Jam Puzzle معي!',
		                        ca_ES: '¡Juega el juego de Screw Jam Puzzle conmigo!',
		                        pt_PT: 'Jogue o jogo Screw Jam Puzzle comigo!',
		                        fr_FR: 'Joue au jeu Screw Jam Puzzle avec moi !',
		                        id_ID: 'Mainkan game Screw Jam Puzzle dengan saya!',
		                        vi_VN: 'Chơi trò Screw Jam Puzzle với tôi!',
		                        th_TH: 'เล่นเกม Screw Jam Puzzle กับฉัน!',
		                        de_DE: 'Spiele das Screw Jam Puzzle-Spiel mit mir!',
		                    }
		                },
		                template: 'test_template',
		                strategy: 'IMMEDIATE',
		                notification: 'PUSH',
						data: {
							"PWF_score":runtime.globalVars.tourPlayTime,
							"PWF_level":runtime.globalVars.level_,
							"PWF_name":runtime.globalVars.fb_playerName,
							"PWF_photo":runtime.globalVars.fb_playerPhoto,
							"PWF_id":runtime.globalVars.fb_playerID
						}
		            }).then(function() {
		                // closes the game after the update is posted.
		                //console.log("updateContext FINISHED");
		            })
		            .catch(function (e) {
		                //console.log("updateContext FAIL");
		            });
	},

	async Renderlevelgame_Event3_Act1(runtime, localVars)
	{
		
	},

	async Global_Event23_Act1(runtime, localVars)
	{
		function formatNumberWithDots(number) {
		    return number.toLocaleString('de-DE');
		}
		localVars.new = formatNumberWithDots(localVars.number);
	},

	async Setting_Event17_Act1(runtime, localVars)
	{
function shadeColor(color, percent) {
    // Xóa ký tự # nếu có
    color = color.replace('#', '');

    // Lấy giá trị R, G, B và Alpha
    let R = parseInt(color.substring(0, 2), 16);
    let G = parseInt(color.substring(2, 4), 16);
    let B = parseInt(color.substring(4, 6), 16);
    let A = color.length === 8 ? parseInt(color.substring(6, 8), 16) : 255; // Mặc định alpha là 255 nếu không có

    // Tính giá trị mới cho R, G, B
    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    // Giới hạn giá trị tối đa là 255
    R = (R < 255) ? R : 255;
    G = (G < 255) ? G : 255;
    B = (B < 255) ? B : 255;

    // Chuyển đổi lại sang dạng hex
    const RR = (R.toString(16).length === 1 ? "0" + R.toString(16) : R.toString(16));
    const GG = (G.toString(16).length === 1 ? "0" + G.toString(16) : G.toString(16));
    const BB = (B.toString(16).length === 1 ? "0" + B.toString(16) : B.toString(16));
    const AA = (A.toString(16).length === 1 ? "0" + A.toString(16) : A.toString(16));

    // Kết quả cuối cùng
    return `#${RR}${GG}${BB}${AA}`;
}
localVars.hex = shadeColor(localVars.hexString,-70)
//console.log(shadeColor("#63C6FF",-40))
//console.log(shadeColor("#63C6FF",40))
	},

	async Setting_Event19_Act1(runtime, localVars)
	{
function hexToRgba(hex) {
    // Xoá ký tự # nếu có
    hex = hex.replace('#', '');

    // Kiểm tra độ dài hợp lệ của chuỗi hex (8 ký tự)
    if (hex.length !== 8) {
        throw new Error('Hex code phải có đúng 8 ký tự!');
    }

    // Lấy giá trị RGB và Alpha
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const a = parseInt(hex.slice(6, 8), 16) / 255;

    //return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
	return `${r},${g},${b}`
}

localVars.rgb_ = String(hexToRgba(localVars.hex))
	},

	async Setting_Event21_Act1(runtime, localVars)
	{
		function componentToHex(c) {
		  var hex = c.toString(16);
		  return hex.length == 1 ? "0" + hex : hex;
		}
		
		function rgbToHex(r, g, b) {
		  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
		}
		
		localVars.hex = rgbToHex(localVars.r, localVars.g, localVars.b);
	},

	async Allfunction_Event2_Act1(runtime, localVars)
	{
		localVars.numberFormat =  new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(localVars.number);
	},

	async Allfunction_Event4_Act1(runtime, localVars)
	{
function remainingTime(endDate) {
    const now = new Date();
    const difference = endDate - now;

    if (difference <= 0) {
        return 'The tournament has ended';
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    if (days > 0) return `${days} Day ${hours} : ${minutes < 10 ? "0" + minutes : minutes}`
    else {
        if (hours > 0) {
            return `${hours} : ${minutes<10?"0"+minutes:minutes} : ${seconds<10?"0"+seconds:seconds}s`;
        }else {
            return `${minutes<10?"0"+minutes:minutes} : ${seconds<10?"0"+seconds:seconds}s`;
        }
    }
    //return `${days} Day ${hours} : ${minutes<10?"0"+minutes:minutes} : ${seconds<10?"0"+seconds:seconds}s`;
    //return `${days} Day ${hours}:${minutes}:${seconds}s`;
}

const endDate = new Date(localVars.timeEnd * 1); // Thay thế bằng ngày kết thúc mong muốn
localVars.timeString = remainingTime(endDate)
	},

	async Allfunction_Event6_Act1(runtime, localVars)
	{
function remainingTime(endDate) {
    const now = new Date();
    const difference = endDate - now;

    if (difference <= 0) {
		runtime.callFunction("check_heart")
        return 'Full';
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    if (days > 0) return `${days} Day ${hours} : ${minutes < 10 ? "0" + minutes : minutes}`
    else {
        if (hours > 0) {
            return `${hours} : ${minutes<10?"0"+minutes:minutes} : ${seconds<10?"0"+seconds:seconds}s`;
        }else {
            return `${minutes<10?"0"+minutes:minutes} : ${seconds<10?"0"+seconds:seconds}s`;
        }
    }
    //return `${days} Day ${hours} : ${minutes<10?"0"+minutes:minutes} : ${seconds<10?"0"+seconds:seconds}s`;
    //return `${days} Day ${hours}:${minutes}:${seconds}s`;
}

const endDate = new Date(localVars.timeEnd * 1); // Thay thế bằng ngày kết thúc mong muốn
localVars.timeString = remainingTime(endDate)
	},

	async Perchase_Event17_Act2(runtime, localVars)
	{
		getPurchasesAsync(localVars.id, localVars.funtionReward, localVars.funtionCancel, runtime)
	}

};

self.C3.ScriptsInEvents = scriptsInEvents;

