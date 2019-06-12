<link rel="stylesheet" href="css/km-multiselect.2.0.0.css">
<form id="myform">
<div id="dependent">
    <div>
        <label>Box 1</label>
        <select id="dependent0" multiple name="dependent0">
            <option value="">--Select--</option>
        </select>
    </div>

    <div>
        <label>Box 2</label>
        <select id="dependent1" multiple name="dependent1">
            <option value="">--Select--</option>
        </select>
    </div>

    <div>
        <label>Box 3</label>
        <select id="dependent2" multiple name="dependent2">
            <option value="">--Select--</option>
        </select>
    </div>
</div>
    <input type="submit" value="submit">
</form>

<script src="https://code.jquery.com/jquery-1.12.4.js"></script>
<script src="js/km-multiselect-2.0.0.js"></script>
<script>
  jQuery('#dependent').kmMultiLevelMultiselect({
    search: true,
    // multiple: false,
    url: 'http://localhost/json/multiselect/data.php',
      selectedTexts:false
  });
</script>