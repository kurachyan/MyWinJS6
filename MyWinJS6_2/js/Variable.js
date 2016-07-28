"use strict";
/*
	情報操作パッケージ

	(内容)
	処理で使う要素の管理・操作を行う。　ｏ５で作業領域を確保した後、ｏ５に対して処理を行う。
	ｏ５を操作するモノは編集後のｏ５を返し、管理情報配列を操作するモノはオフセット番号を返す。
    ｏ７を操作するモノはｏ５同様の扱いを行う。　また、共用なのでパッケージは別管理する。

    （注意）
    ・「vSet」はテーブル情報の書き換えなので、メインの中では使用せずに操作パッケージ内で使用する。
*/

(function (window) {
    // ３）変数情報
    const dfO4 = {
        name: "",                   // 名称
        argc: 0,                    // 要素数
        argv: [],                   // 要素リスト
        result: "",                 // 結果情報（テキスト）

        set Name(value) { this.name = value; },
        set Argc(value) { this.argc = value; },
        set Argv(value) { this.argv = value; },
        set Result(value) { this.result = value; },
        get Name() { return this.name; },
        get Argc() { return this.argc; },
        get Argv() { return this.argv; },
        get Result() { return this.result; }
    };

    let Table = new Array();
    let pos = 0;

    function LocalVariableScript() {
        // Local Variable Script module
        // モジュール名：vInit
        // 　　　　入力：なし
        //　　 　　出力：なし
        // 　　処理内容：資源テーブル情報を作成する
        this.vInit = function() {                   // 初期領域作成
            let o5 = Object.create(dfO4);     // テンプレートを取り出し
            o5.Name = "";					// 要素名のリセット
            o5.Argc = 0;					// 要素数のリセット
            o5.Argv = null;					// 要素リストのリセット
            o5.Result = "";					// 結果情報のリセット

            return o5;						// 新しい初期領域を返す。
        }

        // モジュール名：vAdd
        // 　　　　入力：fname　・・・　登録名
        // 　　　　　　：vlist　・・・　登録リスト
        // 　　　　出力：w1　・・・　資源テーブルの管理番号
        // 　　処理内容：資源テーブル情報の最後尾に追加する
        this.vAdd = function(fname, vlist) {	// シーケンス情報追加
            Table.push(this.vInit());
            let w1 = Table.length - 1;
            Table[w1].Name = fname;		// 要素名の登録
            Table[w1].Result = vlist;		// 元要素の登録
            if (Array.isArray(vlist)) {		// 登録情報は配列か？
                Table[w1].Argc = vlist.length;
                Table[w1].Argv = new Array(vlist.length);
                for (let i = 0; i < vlist.length; i++) {
                    Table[w1].Argv[i] = vlist[i];	// 要素を登録する
                }
            } else {                        // 一次変数
                Table[w1].Argc = 1;
                Table[w1].Argv = vlist;
            }

            pos++;
            return w1;						// 管理番号を返す
        }

        // モジュール名：vDel
        // 　　　　入力：なし
        // 　　　　出力：o5　・・・　抜き取り情報
        // 　　処理内容：資源テーブル情報の最後尾を削除する
        this.vDel = function() {               // 要素情報抜き取り（削除）
            let w1 = Table.length - 1;

            let o5 = this.vInit();
            if (w1 > Number.MIN_VALUE) {   // 削除対象の要素が有るか？
                o5.Name = Table[w1].Name;		// 要素名の取り出し

                if (Array.isArray(Table[w1].Argv)) {		// 登録情報は配列か？
                    o5.Argc = Table[w1].Argc;
                    o5.Argv = new Array(Table[w1].Argc);
                    for (let i = 0; i < Table[w1].Argc; i++) {
                        o5.Argv[i] = Table[w1].Argv[i];	// 要素を登録する
                    }
                } else {                        // 一次変数
                    o5.Argc = 1;
                    o5.Argv = Table[w1].Argv;
                }

                Table.pop();
                --pos;
            }
            return o5;
        }

        // モジュール名：vDup
        // 　　　　入力：なし
        // 　　　　出力：(w1)　・・・　資源テーブルの管理番号
        // 　　処理内容：資源テーブル情報の最後尾を複写する
        this.vDup = function() {               // シーケンス情報重複
            let w1 = Table.length - 1;
            let fname = Table[w1].Name;		// 要素名の登録
            let vlist = null;

            if (Table[w1].argc == 1) {
                vlist = Table[w1].argv;
            } else {
                vlist = new Array(Table[w1].Argc);
                for (let i = 0; i < Table[w1].Argc; i++) {
                    vlist[i] = Table[w1].Argv[i];	// 要素を登録する
                }
            }

            return this.vAdd(fname, vlist);	// 重複情報を登録し、管理番号を返す
        }

        // モジュール名：vSet
        // 　　　　入力：vpos　・・・　実行する番号
        // 　　　　　　：vlist　・・・　設定情報
        // 　　　　出力：w1　・・・　資源テーブルの管理番号
        // 　　処理内容：資源テーブル情報を再設定する
        this.vSet = function(vpos, vlist) {	// シーケンス情報再設定
            if (vpos < pos) {           // 指定は資源テーブル枠内か？
                Table[vpos].Result = vlist;		// 元要素の登録
                if (Array.isArray(vlist)) {		// 登録情報は配列か？
                    Table[vpos].Argc = vlist.length;
                    Table[vpos].Argv = new Array(vlist.length);
                    for (let i = 0; i < vlist.length; i++) {
                        Table[vpos].Argv[i] = vlist[i];	// 要素を登録する
                    }
                } else {                        // 一次変数
                    Table[vpos].Argc = 1;
                    Table[vpos].Argv = vlist;
                }

                return vpos;						// 管理番号を返す
            } else {
                return (Number.MIN_VALUE);          // エラー情報を返す
            }
        }

        // モジュール名：vMap
        // モジュール名：vRed
        // 　　　　入力：vpos　・・・　実行する番号
        // 　　　　　　：logic　・・・　配列加工の処理
        // 　　　　出力：Table[vpos].Argv　・・・　実行結果
        // 　　処理内容：資源テーブル情報で Map  を実行する（vMap）
        // 　　　　　　：資源テーブル情報でReduceを実行する（vRed）
        this.vMap = function(vpos, logic) {	// シーケンス情報更新(Map)
            let vlist = Table[vpos].Result;
            let ans = vlist.map(logic);

            return this.vSet(vpos, ans);
        }
        this.vRed = function(vpos, logic) {	// シーケンス情報更新(Reduce)
            let vlist = Table[vpos].Result;
            let ans = vlist.reduce(logic);

            return this.vSet(vpos, ans);
        }

        // モジュール名：vExc
        // 　　　　入力：vpos　・・・　実行する番号
        // 　　　　　　：adr1・adr2　・・・　交換する番号
        // 　　　　出力：vpos　・・・　実行結果
        // 　　処理内容：資源テーブル情報Argvの中身を交換する
        this.vExc = function(vpos, adr1, adr2) {
            if (Table[vpos].Argc > 1) {          // 交換情報有り？
                if ((Table[vpos].Argc > adr1) && (Table[vpos].Argc > adr2) && (adr1 != adr2)) {
                    let w1 = Table[vpos].Argv[adr1];
                    Table[vpos].Argv[adr1] = Table[vpos].Argv[adr2];
                    Table[vpos].Argv[adr2] = w1;
                }

                return vpos;						// 管理番号を返す
            } else {
                return (Number.MIN_VALUE);          // エラー情報を返す
            }
        }

        // モジュール名：vAddList
        // 　　　　入力：vpos　・・・　実行する番号
        // 　　　　　　：txt ・・・　追加情報
        // 　　　　出力：table[eno].Result　・・・　実行結果
        // 　　処理内容：資源テーブルに情報を追加する
        this.vAddList = function(vpos, txt) {	// シーケンス情報再設定
            Table[vpos].Result = txt;		// 元要素の登録
            if (Array.isArray(Table[vpos].Argv)) {		// 登録情報は配列か？
                Table[vpos].Argv.push(txt);
                Table[vpos].Argc = Table[vpos].Argv.length;
            } else {
                let txt2 = Table[vpos].Argv;
                Table[vpos].Argv = new Array(2);
                Table[vpos].Argv[0] = txt2;
                Table[vpos].Argv[1] = txt;
                Table[vpos].Argc = Table[vpos].Argv.length;
            }
        }

        // モジュール名：Check
        // 　　　　入力：word　・・・　検索する変数名
        // 　　　　出力：(w1)　・・・　資源テーブルの管理番号
        // 　　処理内容：変数名の登録位置を検索する
        this.Check = function (word) {
            let ret = Number.MIN_VALUE;     // 未検出
            for (let i = 0; i < pos; i++) {    // 登録分繰り返す
                if (Table[i].Name == word) {
                    // 検索する変数名
                    ret = i;
                    break;
                }
            }

            return (ret);
        }
        // モジュール名：Getpos
        // 　　　　入力：なし
        // 　　　　出力：pos　・・・　資源テーブルの登録数
        // 　　処理内容：資源テーブルの登録数を取り出す。
        this.Getpos = function () {
            return (pos);
        }
        // モジュール名：Getresult
        // 　　　　入力：eno　・・・　取り出す番号
        // 　　　　出力：table[eno].Result　・・・　実行結果
        // 　　処理内容：残された実行結果を取り出す。
        this.Getresult = function (eno) {
            if (eno > 0 && eno < Table.length) {   // 実行対象の要素が有るか？
                return (Table[eno].Result);
            } else {
                return ("");
            }
        }
    };

    window.LocalVariableScript = LocalVariableScript;
}(window));
