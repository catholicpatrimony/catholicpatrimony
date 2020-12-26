<?
add_filter('body_class','remove_home_class');
function remove_home_class($classes) {
    return array_diff($classes, array('home'));
}
?>
