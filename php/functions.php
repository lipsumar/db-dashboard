<?php
require_once('./dqml2tree.php');

define('DB_HOST','localhost');
define('DB_USER','root');
define('DB_PASS','root');
define('DB_NAME','test');

@mysql_connect(DB_HOST, DB_USER, DB_PASS) or die('Unable to connect to DB.<br/>MySQL said: '.mysql_error());
$db = mysql_select_db(DB_NAME) or die('Connected to DB, but unable to select database.<br/>MySQL said: '.mysql_error());


function getDatabaseTables(){
	$tables = array();
	$query = 'SHOW tables';
	$res = mysql_query($query);
	while($r = mysql_fetch_array($res)){
		$tables[$r[0]] = 1;
	}
	return $tables;
}

function getTableDescription($table){
	$describe = array();
	$query = 'DESCRIBE '.sqle($table);
	$res = mysql_query($query);
	while($r = mysql_fetch_assoc($res)){
		$describe['__fields'][] = $r['Field'];
		$describe[$r['Field']] = $r;
		if($r['Key']=='PRI') $describe['__PRI'] = $r['Field'];
	}
	return $describe;
}

//sql escape
function sqle($s){ return mysql_escape_string($s); }

//make sure a query has a limit
function makeLimitedQuery(&$query,&$sqlTree){
	if(!queryHasLimit($query,$sqlTree)){
		$query .= ' LIMIT 0,30';

		//query changed, remake the tree as well
		$sql2tree = new dqml2tree($query);
		$sqlTree = $sql2tree->make();
	}

}
function queryHasLimit($query,$sqlTree){


	$hasLimit = false;
	if(isset($sqlTree['SQL']['SELECT']['LIMIT'])) $hasLimit = true;

	return $hasLimit;
}

function findInQuery(){
	//get the boundaries
}

//wont touch the query
function execQuery($query){
	$result = array('query'=>$query);
	$timeBegin = microtime(true);
	$res = mysql_query($query);
	$timeEnd = microtime(true);
	$result['duration_ms'] = ($timeEnd - $timeBegin) * 1000;
	$mysql_error = mysql_error();
	if($mysql_error!=''){
		$result['sql_error'] = $mysql_error;
	}else{
		$i=0;
		$result['rows'] = array();
		$result['headers'] = array();
		while($row = mysql_fetch_assoc($res)){
			if($i==0) foreach($row as $fieldName=>$fieldValue) $result['headers'][] = $fieldName;
			foreach($row as $k=>$v){
				$length = mb_strlen($v);
				$v = mb_substr($v,0,100);
				$v = utf8_encode($v);
				$row[$k] = htmlspecialchars($v).($length>100?'&hellip;':'');
			}

			$result['rows'][] = $row;
			$i++;
		}
	}
	return $result;
}

function countQuery($query,$sqlTree){

	// small optimization
	if(preg_match('/^select \\* from/i',$query)){
		$query = preg_replace('/^select \\* from/i','select count(*) as total from',$query);
		$res = mysql_query($query);
		$r = mysql_fetch_assoc($res);
		return $r['total'];
	}

	//...so we don't end up doing this
	$res = mysql_query($query);
	$mysql_error = mysql_error();
	if($mysql_error==''){
		return mysql_num_rows($res);
	}
	return false;
}



?>
