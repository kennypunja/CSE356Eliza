for i in *
	do
		cd $i
		for j in *.json
		do
			mongoimport --db hw2 --collection factbook --file $j --jsonArray
		done
		cd ..
	done
